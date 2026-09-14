export type OutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

export type SourceFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'unknown';

export type ProcessingStatus =
  | 'queued'
  | 'processing'
  | 'done'
  | 'error';

export interface Dimensions {
  width: number;
  height: number;
}

export interface ProcessingSettings {
  format: OutputFormat;
  quality: number;
  maxWidth: number | null;
  maxHeight: number | null;
  lockAspectRatio: boolean;
}

export interface SizeStats {
  originalBytes: number;
  outputBytes: number;
  savedBytes: number;
  reductionPercent: number;
}

export interface CompressionResult {
  blob: Blob;
  objectUrl: string;
  dimensions: Dimensions;
  format: OutputFormat;
  mimeType: string;
  fileName: string;
  sizeStats: SizeStats;
}

export interface SourceImage {
  id: string;
  file: File;
  objectUrl: string;
  format: SourceFormat;
  mimeType: string;
  dimensions: Dimensions | null;
  status: ProcessingStatus;
  error: string | null;
  result: CompressionResult | null;
}

export interface BrowserCapabilities {
  createImageBitmap: boolean;
  canvasToBlob: boolean;
  webpEncode: boolean;
  jpegEncode: boolean;
  pngEncode: boolean;
  avifEncode: boolean;
  avifDecode: boolean;
  clipboard: boolean;
}

export interface ProcessProgress {
  current: number;
  total: number;
  currentFileName: string | null;
}

export const DEFAULT_SETTINGS: ProcessingSettings = {
  format: 'webp',
  quality: 80,
  maxWidth: null,
  maxHeight: null,
  lockAspectRatio: true,
};

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
] as const;

export const FORMAT_MIME: Record<OutputFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

export const FORMAT_EXTENSION: Record<OutputFormat, string> = {
  webp: 'webp',
  jpeg: 'jpg',
  png: 'png',
  avif: 'avif',
};
