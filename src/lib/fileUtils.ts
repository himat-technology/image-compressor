import type { Dimensions, OutputFormat, SourceFormat } from '../types/image';
import { FORMAT_EXTENSION } from '../types/image';

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'] as const;
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const rounded =
    value >= 100
      ? value.toFixed(0)
      : value >= 10
        ? value.toFixed(1)
        : value.toFixed(2);
  return `${Number(rounded)} ${units[unitIndex]}`;
}

export function calculateSizeStats(originalBytes: number, outputBytes: number) {
  const savedBytes = Math.max(0, originalBytes - outputBytes);
  const reductionPercent =
    originalBytes > 0
      ? Math.max(0, ((originalBytes - outputBytes) / originalBytes) * 100)
      : 0;

  return {
    originalBytes,
    outputBytes,
    savedBytes,
    reductionPercent,
  };
}

export function formatReduction(percent: number): string {
  if (!Number.isFinite(percent)) {
    return '0%';
  }
  return `${percent.toFixed(1)}%`;
}

export function detectSourceFormat(file: File): SourceFormat {
  const mime = file.type.toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return 'jpeg';
  }
  if (mime === 'image/png') {
    return 'png';
  }
  if (mime === 'image/webp') {
    return 'webp';
  }
  if (mime === 'image/avif') {
    return 'avif';
  }

  const name = file.name.toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return 'jpeg';
  }
  if (name.endsWith('.png')) {
    return 'png';
  }
  if (name.endsWith('.webp')) {
    return 'webp';
  }
  if (name.endsWith('.avif')) {
    return 'avif';
  }

  return 'unknown';
}

export function isSupportedImageFile(file: File): boolean {
  return detectSourceFormat(file) !== 'unknown';
}

export function getBaseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot <= 0) {
    return fileName;
  }
  return fileName.slice(0, lastDot);
}

export function convertFileName(
  originalName: string,
  format: OutputFormat,
  usedNames?: Set<string>,
): string {
  const base = getBaseName(originalName) || 'image';
  const extension = FORMAT_EXTENSION[format];
  let candidate = `${base}.${extension}`;

  if (!usedNames) {
    return candidate;
  }

  if (!usedNames.has(candidate.toLowerCase())) {
    usedNames.add(candidate.toLowerCase());
    return candidate;
  }

  let counter = 2;
  while (usedNames.has(`${base}-${counter}.${extension}`.toLowerCase())) {
    counter += 1;
  }
  candidate = `${base}-${counter}.${extension}`;
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) {
    return 80;
  }
  return Math.min(100, Math.max(1, Math.round(quality)));
}

export function parseOptionalDimension(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed);
}

export function formatSourceLabel(format: SourceFormat): string {
  switch (format) {
    case 'jpeg':
      return 'JPEG';
    case 'png':
      return 'PNG';
    case 'webp':
      return 'WebP';
    case 'avif':
      return 'AVIF';
    default:
      return 'Unknown';
  }
}

export function formatOutputLabel(format: OutputFormat): string {
  switch (format) {
    case 'jpeg':
      return 'JPEG';
    case 'png':
      return 'PNG';
    case 'webp':
      return 'WebP';
    case 'avif':
      return 'AVIF';
  }
}

export function describeDimensions(dimensions: Dimensions | null): string {
  if (!dimensions) {
    return '—';
  }
  return `${dimensions.width} × ${dimensions.height}`;
}
