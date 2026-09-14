import type { BrowserCapabilities, OutputFormat } from '../types/image';
import { FORMAT_MIME } from '../types/image';
import { clampQuality } from './fileUtils';

async function blobFromCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas && typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob(
      quality === undefined ? { type: mimeType } : { type: mimeType, quality },
    );
  }

  const htmlCanvas = canvas as HTMLCanvasElement;
  return new Promise<Blob>((resolve, reject) => {
    htmlCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode image as ${mimeType}.`));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

async function canEncodeMime(mimeType: string): Promise<boolean> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return false;
    }
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 2, 2);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), mimeType, 0.8);
    });

    return Boolean(blob && blob.type === mimeType && blob.size > 0);
  } catch {
    return false;
  }
}

async function canDecodeAvif(): Promise<boolean> {
  // Tiny 1x1 AVIF
  const avif =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABiaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MEkAAAAAAagAAAQlIAgCwAEnAAEAAQAaAYwCdAEQAhgCCgAAAF5wYXJhAAAAAHgBUgGQAAAAAnBhc3AAAAABAAAAKRQ8IUgAAAAOcGl0bQAAAAABAAEAAEAAAABXYXYxQ4EgAhAAAAAQcGl4aQAAAAADCAgIAAAAF2lwbWEAAAAAAAAAAQABBAECg4QAAAAcYXZmQwAAAAABQwQAAAAAVjUA';

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = avif;
  });
}

let capabilitiesPromise: Promise<BrowserCapabilities> | null = null;

export async function detectBrowserCapabilities(): Promise<BrowserCapabilities> {
  if (capabilitiesPromise) {
    return capabilitiesPromise;
  }

  capabilitiesPromise = (async (): Promise<BrowserCapabilities> => {
    const hasCreateImageBitmap = typeof createImageBitmap === 'function';
    const hasCanvasToBlob =
      typeof HTMLCanvasElement !== 'undefined' &&
      typeof HTMLCanvasElement.prototype.toBlob === 'function';

    const [webpEncode, jpegEncode, pngEncode, avifEncode, avifDecode] =
      await Promise.all([
        canEncodeMime('image/webp'),
        canEncodeMime('image/jpeg'),
        canEncodeMime('image/png'),
        canEncodeMime('image/avif'),
        canDecodeAvif(),
      ]);

    return {
      createImageBitmap: hasCreateImageBitmap,
      canvasToBlob: hasCanvasToBlob,
      webpEncode,
      jpegEncode,
      pngEncode,
      avifEncode,
      avifDecode,
      clipboard:
        typeof navigator !== 'undefined' &&
        Boolean(navigator.clipboard?.writeText),
    };
  })();

  return capabilitiesPromise;
}

export function isFormatEncodable(
  format: OutputFormat,
  capabilities: BrowserCapabilities,
): boolean {
  switch (format) {
    case 'webp':
      return capabilities.webpEncode;
    case 'jpeg':
      return capabilities.jpegEncode;
    case 'png':
      return capabilities.pngEncode;
    case 'avif':
      return capabilities.avifEncode;
  }
}

/**
 * Encode a canvas to the requested output format.
 * PNG ignores quality (lossless). Lossy formats use quality 0–1.
 */
export async function encodeCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  format: OutputFormat,
  qualityPercent: number,
  capabilities: BrowserCapabilities,
): Promise<Blob> {
  if (!isFormatEncodable(format, capabilities)) {
    throw new Error(
      `${format.toUpperCase()} encoding is not supported in this browser.`,
    );
  }

  const mimeType = FORMAT_MIME[format];
  const quality = clampQuality(qualityPercent) / 100;

  if (format === 'png') {
    return blobFromCanvas(canvas, mimeType);
  }

  const blob = await blobFromCanvas(canvas, mimeType, quality);

  if (blob.type && blob.type !== mimeType) {
    throw new Error(
      `Browser returned ${blob.type || 'an unexpected type'} instead of ${mimeType}.`,
    );
  }

  return blob;
}
