import type { SourceImage } from '../types/image';
import { ComparisonView } from './ComparisonView';

interface ImageQueueProps {
  images: SourceImage[];
  copiedId: string | null;
  onDownload: (id: string) => void;
  onCopyBase64: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ImageQueue({
  images,
  copiedId,
  onDownload,
  onCopyBase64,
  onRemove,
}: ImageQueueProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="image-queue" aria-labelledby="queue-heading">
      <div className="section-heading">
        <h2 id="queue-heading">
          {images.length === 1
            ? '1 image selected'
            : `${images.length} images selected`}
        </h2>
        <p>Inspect each result before downloading.</p>
      </div>
      <div className="image-queue__list">
        {images.map((item) => (
          <ComparisonView
            key={item.id}
            item={item}
            copiedId={copiedId}
            onDownload={onDownload}
            onCopyBase64={onCopyBase64}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
