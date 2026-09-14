import { useId } from 'react';
import type { BrowserCapabilities, OutputFormat, ProcessingSettings } from '../types/image';
import { isFormatEncodable } from '../lib/imageEncoder';
import { clampQuality, parseOptionalDimension } from '../lib/fileUtils';

interface CompressionSettingsProps {
  settings: ProcessingSettings;
  capabilities: BrowserCapabilities | null;
  disabled?: boolean;
  onChange: (patch: Partial<ProcessingSettings>) => void;
  onReset: () => void;
}

const FORMAT_OPTIONS: Array<{
  value: OutputFormat;
  label: string;
  recommended?: boolean;
}> = [
  { value: 'webp', label: 'WebP', recommended: true },
  { value: 'jpeg', label: 'JPEG / JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'avif', label: 'AVIF' },
];

export function CompressionSettings({
  settings,
  capabilities,
  disabled = false,
  onChange,
  onReset,
}: CompressionSettingsProps) {
  const qualityId = useId();
  const maxWidthId = useId();
  const maxHeightId = useId();
  const lockId = useId();

  const qualityDisabled = disabled || settings.format === 'png';

  const qualityHint =
    settings.quality <= 40
      ? 'Max Compression'
      : settings.quality >= 90
        ? 'Best Quality'
        : 'Balanced';

  const handleWidthChange = (raw: string) => {
    const width = parseOptionalDimension(raw);
    if (!settings.lockAspectRatio) {
      onChange({ maxWidth: width });
      return;
    }
    if (width === null) {
      onChange({ maxWidth: null, maxHeight: null });
      return;
    }
    if (settings.maxHeight && settings.maxWidth) {
      const aspect = settings.maxWidth / settings.maxHeight;
      onChange({
        maxWidth: width,
        maxHeight: Math.max(1, Math.round(width / aspect)),
      });
      return;
    }
    onChange({ maxWidth: width });
  };

  const handleHeightChange = (raw: string) => {
    const height = parseOptionalDimension(raw);
    if (!settings.lockAspectRatio) {
      onChange({ maxHeight: height });
      return;
    }
    if (height === null) {
      onChange({ maxWidth: null, maxHeight: null });
      return;
    }
    if (settings.maxWidth && settings.maxHeight) {
      const aspect = settings.maxWidth / settings.maxHeight;
      onChange({
        maxHeight: height,
        maxWidth: Math.max(1, Math.round(height * aspect)),
      });
      return;
    }
    onChange({ maxHeight: height });
  };

  return (
    <section className="settings-panel" aria-labelledby="settings-heading">
      <div className="settings-panel__header">
        <div>
          <p className="eyebrow">Compression &amp; Format Settings</p>
          <h2 id="settings-heading">Configure output</h2>
        </div>
        <span className="badge" title="Images never leave your device">
          100% Client-Side Processing
        </span>
      </div>

      <fieldset className="settings-fieldset" disabled={disabled}>
        <legend>Target Output Format</legend>
        <div className="format-grid" role="radiogroup" aria-label="Target output format">
          {FORMAT_OPTIONS.map((option) => {
            const supported =
              !capabilities || isFormatEncodable(option.value, capabilities);
            const selected = settings.format === option.value;

            return (
              <label
                key={option.value}
                className={`format-option${selected ? ' is-selected' : ''}${!supported ? ' is-disabled' : ''}`}
              >
                <input
                  type="radio"
                  name="output-format"
                  value={option.value}
                  checked={selected}
                  disabled={!supported}
                  onChange={() => onChange({ format: option.value })}
                />
                <span className="format-option__label">
                  {option.label}
                  {option.recommended ? (
                    <span className="format-option__tag">Recommended</span>
                  ) : null}
                </span>
                {!supported ? (
                  <span className="format-option__note">Not supported here</span>
                ) : null}
              </label>
            );
          })}
        </div>
        {capabilities && !capabilities.avifEncode ? (
          <p className="field-note">
            AVIF encoding is unavailable in this browser. Decoding may still work
            for AVIF uploads when the browser supports it.
          </p>
        ) : null}
      </fieldset>

      <div className="settings-row">
        <div className="field">
          <div className="field__label-row">
            <label htmlFor={qualityId}>Image Quality</label>
            <span className="field__value" aria-live="polite">
              {settings.quality}%
            </span>
          </div>
          <input
            id={qualityId}
            type="range"
            min={1}
            max={100}
            step={1}
            value={settings.quality}
            disabled={qualityDisabled}
            aria-valuemin={1}
            aria-valuemax={100}
            aria-valuenow={settings.quality}
            aria-valuetext={`${settings.quality} percent`}
            onChange={(event) =>
              onChange({ quality: clampQuality(Number(event.target.value)) })
            }
          />
          <div className="quality-scale" aria-hidden="true">
            <span>Max Compression</span>
            <span>{qualityHint} ({settings.quality}%)</span>
            <span>Best Quality</span>
          </div>
          {settings.format === 'png' ? (
            <p className="field-note">
              PNG is lossless. The quality slider does not apply to PNG output.
            </p>
          ) : null}
        </div>
      </div>

      <div className="settings-row">
        <p className="settings-subtitle">Max Dimensions (Optional Scaling)</p>
        <div className="dimension-grid">
          <div className="field">
            <label htmlFor={maxWidthId}>Max Width (px)</label>
            <input
              id={maxWidthId}
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Auto"
              value={settings.maxWidth ?? ''}
              disabled={disabled}
              onChange={(event) => handleWidthChange(event.target.value)}
            />
          </div>
          <span className="dimension-sep" aria-hidden="true">
            ×
          </span>
          <div className="field">
            <label htmlFor={maxHeightId}>Max Height (px)</label>
            <input
              id={maxHeightId}
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Auto"
              value={settings.maxHeight ?? ''}
              disabled={disabled}
              onChange={(event) => handleHeightChange(event.target.value)}
            />
          </div>
          <label className="lock-toggle" htmlFor={lockId}>
            <input
              id={lockId}
              type="checkbox"
              checked={settings.lockAspectRatio}
              disabled={disabled}
              onChange={(event) =>
                onChange({ lockAspectRatio: event.target.checked })
              }
            />
            <span>Lock Aspect Ratio</span>
          </label>
        </div>
        <p className="field-note">
          Images are never upscaled. Leave blank to keep original dimensions.
        </p>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn--ghost" onClick={onReset} disabled={disabled}>
          Reset settings
        </button>
      </div>
    </section>
  );
}
