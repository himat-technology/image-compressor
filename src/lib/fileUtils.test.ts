import { describe, expect, it } from 'vitest';
import {
  calculateSizeStats,
  clampQuality,
  convertFileName,
  detectSourceFormat,
  formatBytes,
  formatReduction,
  getBaseName,
  parseOptionalDimension,
} from '../lib/fileUtils';
import {
  calculateTargetDimensions,
  syncAspectDimension,
} from '../lib/imageResizer';
import { blobToBase64DataUri } from '../lib/base64Utils';

describe('calculateTargetDimensions', () => {
  it('keeps original size when no max dimensions are set', () => {
    expect(
      calculateTargetDimensions(
        { width: 1920, height: 1080 },
        { maxWidth: null, maxHeight: null },
      ),
    ).toEqual({ width: 1920, height: 1080 });
  });

  it('scales down to fit both max width and height', () => {
    expect(
      calculateTargetDimensions(
        { width: 2000, height: 1000 },
        { maxWidth: 1000, maxHeight: 1000 },
      ),
    ).toEqual({ width: 1000, height: 500 });
  });

  it('does not upscale when max dimensions exceed source', () => {
    expect(
      calculateTargetDimensions(
        { width: 800, height: 600 },
        { maxWidth: 1600, maxHeight: 1200 },
      ),
    ).toEqual({ width: 800, height: 600 });
  });

  it('scales by max width only while preserving aspect ratio', () => {
    expect(
      calculateTargetDimensions(
        { width: 1200, height: 600 },
        { maxWidth: 600, maxHeight: null },
      ),
    ).toEqual({ width: 600, height: 300 });
  });
});

describe('syncAspectDimension', () => {
  it('calculates height from width using source aspect', () => {
    expect(syncAspectDimension(16 / 9, 'width', 1600)).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it('calculates width from height using source aspect', () => {
    expect(syncAspectDimension(4 / 3, 'height', 600)).toEqual({
      width: 800,
      height: 600,
    });
  });
});

describe('file size helpers', () => {
  it('formats bytes into readable units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(2_400_000)).toBe('2.29 MB');
  });

  it('calculates saved bytes and reduction percentage', () => {
    const stats = calculateSizeStats(2_400_000, 620_000);
    expect(stats.savedBytes).toBe(1_780_000);
    expect(stats.reductionPercent).toBeCloseTo(74.1666, 2);
    expect(formatReduction(stats.reductionPercent)).toBe('74.2%');
  });

  it('handles zero original size safely', () => {
    const stats = calculateSizeStats(0, 0);
    expect(stats.savedBytes).toBe(0);
    expect(stats.reductionPercent).toBe(0);
  });
});

describe('filename and format helpers', () => {
  it('converts extensions for output formats', () => {
    expect(convertFileName('photo.jpg', 'webp')).toBe('photo.webp');
    expect(convertFileName('photo.png', 'jpeg')).toBe('photo.jpg');
    expect(convertFileName('asset', 'avif')).toBe('asset.avif');
  });

  it('avoids filename collisions when a set is provided', () => {
    const used = new Set<string>();
    expect(convertFileName('photo.jpg', 'webp', used)).toBe('photo.webp');
    expect(convertFileName('photo.png', 'webp', used)).toBe('photo-2.webp');
  });

  it('detects source formats from mime and extension', () => {
    expect(
      detectSourceFormat(new File([], 'a.jpg', { type: 'image/jpeg' })),
    ).toBe('jpeg');
    expect(
      detectSourceFormat(new File([], 'a.webp', { type: 'image/webp' })),
    ).toBe('webp');
    expect(
      detectSourceFormat(new File([], 'a.gif', { type: 'image/gif' })),
    ).toBe('unknown');
  });

  it('clamps quality and parses dimensions', () => {
    expect(clampQuality(0)).toBe(1);
    expect(clampQuality(150)).toBe(100);
    expect(clampQuality(80.4)).toBe(80);
    expect(parseOptionalDimension('')).toBeNull();
    expect(parseOptionalDimension('1280')).toBe(1280);
    expect(parseOptionalDimension('-10')).toBeNull();
    expect(getBaseName('folder/name.png')).toBe('folder/name');
  });
});

describe('base64Utils', () => {
  it('creates a data URI from a blob', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const dataUri = await blobToBase64DataUri(blob);
    expect(dataUri.startsWith('data:text/plain;base64,')).toBe(true);
    expect(dataUri.includes('aGVsbG8=')).toBe(true);
  });
});
