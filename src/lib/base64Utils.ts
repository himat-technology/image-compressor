function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to convert image to Base64.'));
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image data for Base64 conversion.'));
    };
    reader.readAsDataURL(blob);
  });
}

export async function blobToBase64DataUri(blob: Blob): Promise<string> {
  return blobToDataUri(blob);
}

export async function copyBlobAsBase64(blob: Blob): Promise<string> {
  const dataUri = await blobToBase64DataUri(blob);

  if (!navigator.clipboard?.writeText) {
    throw new Error(
      'Clipboard access is unavailable in this browser. Copy the Base64 manually if needed.',
    );
  }

  try {
    await navigator.clipboard.writeText(dataUri);
  } catch {
    throw new Error(
      'Could not copy to the clipboard. Check browser permissions and try again.',
    );
  }

  return dataUri;
}
