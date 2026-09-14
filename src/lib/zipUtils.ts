import JSZip from 'jszip';
import { downloadBlob } from './downloadUtils';

export interface ZipEntry {
  fileName: string;
  blob: Blob;
}

export async function downloadImagesAsZip(
  entries: ZipEntry[],
  zipFileName = 'compressed-images.zip',
): Promise<void> {
  if (entries.length === 0) {
    throw new Error('No processed images are available to download.');
  }

  const zip = new JSZip();
  const used = new Set<string>();

  for (const entry of entries) {
    let name = entry.fileName;
    const lower = name.toLowerCase();
    if (used.has(lower)) {
      const dot = name.lastIndexOf('.');
      const base = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : '';
      let counter = 2;
      while (used.has(`${base}-${counter}${ext}`.toLowerCase())) {
        counter += 1;
      }
      name = `${base}-${counter}${ext}`;
    }
    used.add(name.toLowerCase());
    zip.file(name, entry.blob);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  downloadBlob(zipBlob, zipFileName);
}
