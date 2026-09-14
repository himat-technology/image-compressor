interface DownloadControlsProps {
  imageCount: number;
  doneCount: number;
  isProcessing: boolean;
  onProcess: () => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
}

export function DownloadControls({
  imageCount,
  doneCount,
  isProcessing,
  onProcess,
  onDownloadAll,
  onClearAll,
}: DownloadControlsProps) {
  if (imageCount === 0) {
    return null;
  }

  return (
    <div className="toolbar" role="toolbar" aria-label="Batch actions">
      <button
        type="button"
        className="btn btn--primary"
        onClick={onProcess}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing…' : 'Process images'}
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={onDownloadAll}
        disabled={isProcessing || doneCount === 0}
      >
        Download All (ZIP)
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={onClearAll}
        disabled={isProcessing}
      >
        Clear all
      </button>
    </div>
  );
}
