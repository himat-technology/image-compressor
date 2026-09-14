import type { Dimensions } from '../types/image';

export interface ResizeOptions {
  maxWidth: number | null;
  maxHeight: number | null;
  /** When true, never enlarge beyond the source size. Default: true */
  avoidUpscale?: boolean;
}

/**
 * Calculate target dimensions for optional max-width / max-height constraints.
 * Does not upscale by default when max dimensions exceed the source.
 */
export function calculateTargetDimensions(
  source: Dimensions,
  options: ResizeOptions,
): Dimensions {
  const avoidUpscale = options.avoidUpscale !== false;
  const maxWidth = options.maxWidth;
  const maxHeight = options.maxHeight;

  if (
    (maxWidth === null || maxWidth <= 0) &&
    (maxHeight === null || maxHeight <= 0)
  ) {
    return { ...source };
  }

  let width = source.width;
  let height = source.height;
  const aspect = source.width / source.height;

  if (maxWidth !== null && maxWidth > 0 && maxHeight !== null && maxHeight > 0) {
    const widthRatio = maxWidth / source.width;
    const heightRatio = maxHeight / source.height;
    let scale = Math.min(widthRatio, heightRatio);

    if (avoidUpscale) {
      scale = Math.min(scale, 1);
    }

    width = Math.max(1, Math.round(source.width * scale));
    height = Math.max(1, Math.round(source.height * scale));
    return { width, height };
  }

  if (maxWidth !== null && maxWidth > 0) {
    if (avoidUpscale && maxWidth >= source.width) {
      return { ...source };
    }
    width = Math.max(1, Math.round(maxWidth));
    height = Math.max(1, Math.round(width / aspect));
    return { width, height };
  }

  if (maxHeight !== null && maxHeight > 0) {
    if (avoidUpscale && maxHeight >= source.height) {
      return { ...source };
    }
    height = Math.max(1, Math.round(maxHeight));
    width = Math.max(1, Math.round(height * aspect));
    return { width, height };
  }

  return { ...source };
}

/**
 * When aspect ratio is locked, derive the paired dimension from the other.
 */
export function syncAspectDimension(
  sourceAspect: number,
  changed: 'width' | 'height',
  value: number | null,
): { width: number | null; height: number | null } {
  if (value === null || value <= 0 || !Number.isFinite(sourceAspect) || sourceAspect <= 0) {
    return { width: value, height: null };
  }

  if (changed === 'width') {
    return {
      width: value,
      height: Math.max(1, Math.round(value / sourceAspect)),
    };
  }

  return {
    width: Math.max(1, Math.round(value * sourceAspect)),
    height: value,
  };
}
