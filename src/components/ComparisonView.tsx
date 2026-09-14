import type { SourceImage } from '../types/image';
import {
  describeDimensions,
  formatBytes,
  formatOutputLabel,
  formatReduction,
  formatSourceLabel,
} from '../lib/fileUtils';

interface ComparisonViewProps {
  item: SourceImage;
  copiedId: string | null;
  onDownload: (id: string) => void;
  onCopyBase64: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ComparisonView({
  item,
  copiedId,
  onDownload,
  onCopyBase64,
  onRemove,
}: ComparisonViewProps) {
  const result = item.result;

  return (
    <article className="comparison" aria-label={`Result for ${item.file.name}`}>
      <header className="comparison__header">
        <div>
          <h3 className="comparison__title">{item.file.name}</h3>
          <p className="comparison__status">
            {item.status === 'processing' && 'Processing…'}
            {item.status === 'queued' && 'Queued'}
            {item.status === 'done' && 'Ready'}
            {item.status === 'error' && 'Failed'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.file.name}`}
        >
          Remove
        </button>
      </header>

      {item.error ? (
        <p className="comparison__error" role="alert">
          {item.error}
        </p>
      ) : null}

      <div className="comparison__grid">
        <figure className="preview-pane">
          <figcaption>Original</figcaption>
          <div className="preview-pane__frame">
            <img src={item.objectUrl} alt={`Original ${item.file.name}`} />
          </div>
          <dl className="meta-list">
            <div>
              <dt>Dimensions</dt>
              <dd>{describeDimensions(item.dimensions)}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{formatSourceLabel(item.format)}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{formatBytes(item.file.size)}</dd>
            </div>
          </dl>
        </figure>

        <figure className="preview-pane">
          <figcaption>Compressed / Converted</figcaption>
          <div className="preview-pane__frame">
            {result ? (
              <img
                src={result.objectUrl}
                alt={`Compressed ${result.fileName}`}
              />
            ) : (
              <div className="preview-pane__placeholder">
                {item.status === 'processing'
                  ? 'Encoding…'
                  : 'Awaiting processing'}
              </div>
            )}
          </div>
          <dl className="meta-list">
            <div>
              <dt>Dimensions</dt>
              <dd>
                {result
                  ? describeDimensions(result.dimensions)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>
                {result ? formatOutputLabel(result.format) : '—'}
              </dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{result ? formatBytes(result.sizeStats.outputBytes) : '—'}</dd>
            </div>
          </dl>
        </figure>
      </div>

      {result ? (
        <div className="stats-bar">
          <div>
            <span className="stats-bar__label">Original</span>
            <strong>{formatBytes(result.sizeStats.originalBytes)}</strong>
          </div>
          <div>
            <span className="stats-bar__label">Compressed</span>
            <strong>{formatBytes(result.sizeStats.outputBytes)}</strong>
          </div>
          <div>
            <span className="stats-bar__label">Saved</span>
            <strong>{formatBytes(result.sizeStats.savedBytes)}</strong>
          </div>
          <div>
            <span className="stats-bar__label">Reduction</span>
            <strong>{formatReduction(result.sizeStats.reductionPercent)}</strong>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="comparison__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onDownload(item.id)}
          >
            Download
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onCopyBase64(item.id)}
          >
            {copiedId === item.id ? 'Copied!' : 'Copy Base64'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
