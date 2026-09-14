import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BrowserCapabilities,
  ProcessProgress,
  ProcessingSettings,
  SourceImage,
} from '../types/image';
import { DEFAULT_SETTINGS } from '../types/image';
import { downloadFromObjectUrl } from '../lib/downloadUtils';
import {
  createId,
  detectSourceFormat,
  isSupportedImageFile,
} from '../lib/fileUtils';
import { copyBlobAsBase64 } from '../lib/base64Utils';
import {
  detectBrowserCapabilities,
  isFormatEncodable,
} from '../lib/imageEncoder';
import {
  ImageProcessingError,
  processImageFile,
  readImageDimensions,
} from '../lib/imageProcessor';
import { downloadImagesAsZip } from '../lib/zipUtils';

const CONCURRENCY = 2;

function revokeSourceUrls(item: SourceImage): void {
  URL.revokeObjectURL(item.objectUrl);
  if (item.result?.objectUrl) {
    URL.revokeObjectURL(item.result.objectUrl);
  }
}

export function useImageProcessor() {
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<SourceImage[]>([]);
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress>({
    current: 0,
    total: 0,
    currentFileName: null,
  });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const imagesRef = useRef(images);
  const settingsRef = useRef(settings);
  const abortRef = useRef(false);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    detectBrowserCapabilities()
      .then((caps) => {
        if (!cancelled) {
          setCapabilities(caps);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGlobalError(
            'Could not detect browser image capabilities. Some features may be unavailable.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      for (const item of imagesRef.current) {
        revokeSourceUrls(item);
      }
    };
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<ProcessingSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (
          capabilities &&
          patch.format &&
          !isFormatEncodable(patch.format, capabilities)
        ) {
          setGlobalError(
            `${patch.format.toUpperCase()} encoding is not supported in this browser.`,
          );
          return prev;
        }
        return next;
      });
    },
    [capabilities],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setGlobalError(null);
    setStatusMessage('Settings reset to defaults.');
  }, []);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) {
      return;
    }

    setGlobalError(null);
    const accepted: SourceImage[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      if (!isSupportedImageFile(file)) {
        rejected.push(`${file.name}: unsupported file type`);
        continue;
      }

      const objectUrl = URL.createObjectURL(file);
      const format = detectSourceFormat(file);

      let dimensions = null;
      try {
        dimensions = await readImageDimensions(file);
      } catch {
        // Keep the file queued; processing will surface a clearer error
      }

      accepted.push({
        id: createId(),
        file,
        objectUrl,
        format,
        mimeType: file.type || `image/${format}`,
        dimensions,
        status: 'queued',
        error: null,
        result: null,
      });
    }

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
      setStatusMessage(
        accepted.length === 1
          ? `Added ${accepted[0].file.name}`
          : `Added ${accepted.length} images`,
      );
    }

    if (rejected.length > 0) {
      setGlobalError(
        rejected.length === 1
          ? rejected[0]
          : `${rejected.length} files were skipped. Only PNG, JPEG, WebP, and AVIF are supported.`,
      );
    }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeSourceUrls(target);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    abortRef.current = true;
    setImages((prev) => {
      for (const item of prev) {
        revokeSourceUrls(item);
      }
      return [];
    });
    setProgress({ current: 0, total: 0, currentFileName: null });
    setIsProcessing(false);
    setStatusMessage('Cleared all images.');
    setGlobalError(null);
    window.setTimeout(() => {
      abortRef.current = false;
    }, 0);
  }, []);

  const processAll = useCallback(async () => {
    const caps = capabilities;
    if (!caps) {
      setGlobalError('Browser capabilities are still loading. Please try again.');
      return;
    }

    const currentSettings = settingsRef.current;
    if (!isFormatEncodable(currentSettings.format, caps)) {
      setGlobalError(
        `${currentSettings.format.toUpperCase()} encoding is not supported in this browser. Choose another format.`,
      );
      return;
    }

    const snapshot = [...imagesRef.current];

    if (snapshot.length === 0) {
      setGlobalError('Add at least one image before processing.');
      return;
    }

    abortRef.current = false;
    setIsProcessing(true);
    setGlobalError(null);
    setStatusMessage(null);

    for (const item of snapshot) {
      if (item.result?.objectUrl) {
        URL.revokeObjectURL(item.result.objectUrl);
      }
    }

    const pendingIds = snapshot.map((item) => item.id);
    const fileById = new Map(snapshot.map((item) => [item.id, item.file]));
    const total = pendingIds.length;
    let completed = 0;
    let successCount = 0;
    let errorCount = 0;
    const usedNames = new Set<string>();

    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'queued' as const,
        error: null,
        result: null,
      })),
    );

    setProgress({
      current: 0,
      total,
      currentFileName: null,
    });

    const processOne = async (id: string) => {
      if (abortRef.current) {
        return;
      }

      const file = fileById.get(id);
      if (!file) {
        return;
      }

      setImages((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, status: 'processing', error: null }
            : entry,
        ),
      );
      setProgress({
        current: completed,
        total,
        currentFileName: file.name,
      });

      try {
        const result = await processImageFile(
          file,
          settingsRef.current,
          caps,
          usedNames,
        );

        if (abortRef.current) {
          URL.revokeObjectURL(result.objectUrl);
          return;
        }

        successCount += 1;
        setImages((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  status: 'done',
                  error: null,
                  result,
                  dimensions: entry.dimensions ?? result.dimensions,
                }
              : entry,
          ),
        );
      } catch (error) {
        errorCount += 1;
        const message =
          error instanceof ImageProcessingError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Processing failed for this image.';

        setImages((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  status: 'error',
                  error: message,
                  result: null,
                }
              : entry,
          ),
        );
      } finally {
        completed += 1;
        setProgress({
          current: completed,
          total,
          currentFileName: file.name,
        });
      }
    };

    let index = 0;
    const workers = Array.from(
      { length: Math.min(CONCURRENCY, pendingIds.length) },
      async () => {
        while (index < pendingIds.length && !abortRef.current) {
          const currentIndex = index;
          index += 1;
          const id = pendingIds[currentIndex];
          if (id) {
            await processOne(id);
          }
        }
      },
    );

    await Promise.all(workers);

    setIsProcessing(false);
    setProgress((prev) => ({ ...prev, currentFileName: null }));

    if (!abortRef.current) {
      if (errorCount > 0 && successCount > 0) {
        setStatusMessage(
          `Processed ${successCount} of ${total} images. ${errorCount} failed.`,
        );
      } else if (errorCount > 0) {
        setGlobalError(
          'All images failed to process. Check format support and try again.',
        );
      } else {
        setStatusMessage(
          total === 1
            ? 'Image processed successfully.'
            : `Processed ${successCount} images successfully.`,
        );
      }
    }
  }, [capabilities]);

  const downloadOne = useCallback((id: string) => {
    const item = imagesRef.current.find((entry) => entry.id === id);
    if (!item?.result) {
      return;
    }
    downloadFromObjectUrl(item.result.objectUrl, item.result.fileName);
  }, []);

  const downloadAll = useCallback(async () => {
    const entries = imagesRef.current
      .filter((item) => item.result)
      .map((item) => ({
        fileName: item.result!.fileName,
        blob: item.result!.blob,
      }));

    if (entries.length === 0) {
      setGlobalError('No successfully processed images to download.');
      return;
    }

    try {
      await downloadImagesAsZip(entries);
      setStatusMessage(
        entries.length === 1
          ? 'Downloaded 1 image as ZIP.'
          : `Downloaded ${entries.length} images as ZIP.`,
      );
    } catch (error) {
      setGlobalError(
        error instanceof Error
          ? error.message
          : 'Failed to create the ZIP archive.',
      );
    }
  }, []);

  const copyBase64 = useCallback(async (id: string) => {
    const item = imagesRef.current.find((entry) => entry.id === id);
    if (!item?.result) {
      return;
    }

    try {
      await copyBlobAsBase64(item.result.blob);
      setCopiedId(id);
      setStatusMessage(`Copied Base64 for ${item.result.fileName}`);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2_000);
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : 'Failed to copy Base64.',
      );
    }
  }, []);

  const doneCount = images.filter((item) => item.status === 'done').length;

  return {
    settings,
    updateSettings,
    resetSettings,
    images,
    capabilities,
    isProcessing,
    progress,
    globalError,
    statusMessage,
    copiedId,
    doneCount,
    addFiles,
    removeImage,
    clearAll,
    processAll,
    downloadOne,
    downloadAll,
    copyBase64,
    setGlobalError,
    setStatusMessage,
  };
}
