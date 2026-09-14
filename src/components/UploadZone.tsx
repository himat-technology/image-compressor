import { useId, useRef, useState, type DragEvent, type ChangeEvent } from 'react';

interface UploadZoneProps {
  disabled?: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
}

export function UploadZone({ disabled = false, onFilesSelected }: UploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) {
      return;
    }
    onFilesSelected(files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  return (
    <div
      className={`upload-zone${isDragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="region"
      aria-label="Image upload drop zone"
    >
      <input
        ref={inputRef}
        id={inputId}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
        multiple
        disabled={disabled}
        onChange={onChange}
      />
      <div className="upload-zone__icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect
            x="6"
            y="10"
            width="28"
            height="22"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M6 26l7.5-7.5a2 2 0 012.8 0L24 26m-3-3l2.2-2.2a2 2 0 012.8 0L34 28"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="17" r="2" fill="currentColor" />
        </svg>
      </div>
      <p className="upload-zone__title">
        Drop PNG, JPEG, WebP, or AVIF images here
      </p>
      <p className="upload-zone__subtitle">
        or{' '}
        <label htmlFor={inputId} className="upload-zone__browse">
          browse local files
        </label>{' '}
        from your device. Compressed instantly in browser memory.
      </p>
      <p className="upload-zone__meta">
        Fast Client-Side Batch Processing · Zero Uploads
      </p>
    </div>
  );
}
