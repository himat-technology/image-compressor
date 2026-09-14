import type { ProcessProgress } from '../types/image';

interface ProgressIndicatorProps {
  isProcessing: boolean;
  progress: ProcessProgress;
}

export function ProgressIndicator({
  isProcessing,
  progress,
}: ProgressIndicatorProps) {
  if (!isProcessing && progress.total === 0) {
    return null;
  }

  if (!isProcessing && progress.current >= progress.total && progress.total > 0) {
    return null;
  }

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div
      className="progress"
      role="status"
      aria-live="polite"
      aria-busy={isProcessing}
    >
      <div className="progress__header">
        <p>
          {isProcessing
            ? `Processing ${Math.min(progress.current + 1, progress.total)} of ${progress.total}…`
            : 'Processing complete'}
        </p>
        <span>{percent}%</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
      {progress.currentFileName ? (
        <p className="progress__file">{progress.currentFileName}</p>
      ) : null}
    </div>
  );
}
