import type {
  BrowserCapabilities,
  CompressionResult,
  Dimensions,
  ProcessingSettings,
} from '../types/image';
import { FORMAT_MIME } from '../types/image';
import { calculateSizeStats, convertFileName } from './fileUtils';
import { encodeCanvas, isFormatEncodable } from './imageEncoder';
import { calculateTargetDimensions } from './imageResizer';

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

async function decodeWithImageElement(file: File): Promise<{
  bitmap: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  close: () => void;
}> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(
          new ImageProcessingError(
            'Could not decode this image. It may be corrupted or unsupported.',
          ),
        );
      img.src = objectUrl;
    });

    return {
      bitmap: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      close: () => {
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function decodeImage(
  file: File,
  capabilities: BrowserCapabilities,
): Promise<{
  bitmap: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  close: () => void;
}> {
  if (capabilities.createImageBitmap) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => {
          bitmap.close();
        },
      };
    } catch {
      // Fall through to HTMLImageElement decoding
    }
  }

  return decodeWithImageElement(file);
}

function createDrawingCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new ImageProcessingError(
      'Could not initialize a drawing canvas in this browser.',
    );
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
}

export async function readImageDimensions(file: File): Promise<Dimensions> {
  const capabilities: BrowserCapabilities = {
    createImageBitmap: typeof createImageBitmap === 'function',
    canvasToBlob: true,
    webpEncode: true,
    jpegEncode: true,
    pngEncode: true,
    avifEncode: false,
    avifDecode: true,
    clipboard: false,
  };

  const decoded = await decodeImage(file, capabilities);
  try {
    if (decoded.width <= 0 || decoded.height <= 0) {
      throw new ImageProcessingError('Image has invalid dimensions.');
    }
    return { width: decoded.width, height: decoded.height };
  } finally {
    decoded.close();
  }
}

export async function processImageFile(
  file: File,
  settings: ProcessingSettings,
  capabilities: BrowserCapabilities,
  usedNames?: Set<string>,
): Promise<CompressionResult> {
  if (!capabilities.canvasToBlob) {
    throw new ImageProcessingError(
      'This browser does not support canvas image encoding (toBlob).',
    );
  }

  if (!isFormatEncodable(settings.format, capabilities)) {
    throw new ImageProcessingError(
      `${settings.format.toUpperCase()} encoding is not available in this browser. Choose WebP, JPEG, or PNG instead.`,
    );
  }

  const decoded = await decodeImage(file, capabilities);

  try {
    if (decoded.width <= 0 || decoded.height <= 0) {
      throw new ImageProcessingError('Image has invalid dimensions.');
    }

    const sourceDimensions: Dimensions = {
      width: decoded.width,
      height: decoded.height,
    };

    const target = calculateTargetDimensions(sourceDimensions, {
      maxWidth: settings.maxWidth,
      maxHeight: settings.maxHeight,
      avoidUpscale: true,
    });

    const { canvas, ctx } = createDrawingCanvas(target.width, target.height);

    // Fill white background for JPEG (no alpha) to avoid black transparency
    if (settings.format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, target.width, target.height);
    }

    ctx.drawImage(decoded.bitmap, 0, 0, target.width, target.height);

    const blob = await encodeCanvas(
      canvas,
      settings.format,
      settings.quality,
      capabilities,
    );

    const objectUrl = URL.createObjectURL(blob);
    const fileName = convertFileName(file.name, settings.format, usedNames);
    const sizeStats = calculateSizeStats(file.size, blob.size);

    return {
      blob,
      objectUrl,
      dimensions: target,
      format: settings.format,
      mimeType: FORMAT_MIME[settings.format],
      fileName,
      sizeStats,
    };
  } finally {
    decoded.close();
  }
}
