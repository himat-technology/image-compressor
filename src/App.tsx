import { CompressionSettings } from './components/CompressionSettings';
import { DownloadControls } from './components/DownloadControls';
import { HowItWorks } from './components/HowItWorks';
import { ImageQueue } from './components/ImageQueue';
import { PrivacyBanner } from './components/PrivacyBanner';
import { ProgressIndicator } from './components/ProgressIndicator';
import { SocialLinks } from './components/SocialLinks';
import { UploadZone } from './components/UploadZone';
import { useImageProcessor } from './hooks/useImageProcessor';
import { HIMAT_LINKS } from './lib/links';

export default function App() {
  const {
    settings,
    updateSettings,
    resetSettings,
    images,
    capabilities,
    isProcessing,
    progress,
    globalError,
    statusMessage,
    copiedId,
    doneCount,
    addFiles,
    removeImage,
    clearAll,
    processAll,
    downloadOne,
    downloadAll,
    copyBase64,
  } = useImageProcessor();

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <a
            className="brand"
            href={HIMAT_LINKS.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HiMat Technology website"
          >
            <span className="brand__mark" aria-hidden="true">
              H
            </span>
            <span className="brand__text">
              <strong>HiMat</strong>
              <span>Technology</span>
            </span>
          </a>
          <div className="site-header__actions">
            <SocialLinks compact />
            <a
              className="btn btn--demo"
              href={HIMAT_LINKS.demo}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">HiMat Technology · Free tools</p>
          <h1>Image Compressor &amp; WebP/AVIF Converter</h1>
          <p className="hero__lead">
            Compress, resize, and convert JPEG, PNG, WebP, and AVIF images
            instantly in browser memory. Zero server uploads ensure complete
            privacy.
          </p>
          <div className="hero__cta">
            <a
              className="btn btn--primary"
              href={HIMAT_LINKS.demo}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open hosted demo
            </a>
            <a
              className="btn btn--secondary"
              href={HIMAT_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit himat.tech
            </a>
          </div>
        </section>

        <div className="workspace">
          <CompressionSettings
            settings={settings}
            capabilities={capabilities}
            disabled={isProcessing}
            onChange={updateSettings}
            onReset={resetSettings}
          />

          <UploadZone disabled={isProcessing} onFilesSelected={addFiles} />

          <DownloadControls
            imageCount={images.length}
            doneCount={doneCount}
            isProcessing={isProcessing}
            onProcess={() => {
              void processAll();
            }}
            onDownloadAll={() => {
              void downloadAll();
            }}
            onClearAll={clearAll}
          />

          <ProgressIndicator isProcessing={isProcessing} progress={progress} />

          {globalError ? (
            <p className="alert alert--error" role="alert">
              {globalError}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="alert alert--info" role="status">
              {statusMessage}
            </p>
          ) : null}

          <ImageQueue
            images={images}
            copiedId={copiedId}
            onDownload={downloadOne}
            onCopyBase64={(id) => {
              void copyBase64(id);
            }}
            onRemove={removeImage}
          />
        </div>

        <PrivacyBanner />
        <HowItWorks />

        <section className="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">FAQ</h2>
          <details>
            <summary>Is my image uploaded to a server?</summary>
            <p>
              No. Processing runs entirely in your browser. Original and
              converted files stay in local memory unless you download them.
            </p>
          </details>
          <details>
            <summary>Why convert to WebP or AVIF?</summary>
            <p>
              Next-gen formats often produce smaller files than JPEG or PNG at
              similar visual quality, which can improve page load performance.
            </p>
          </details>
          <details>
            <summary>How does local compression work?</summary>
            <p>
              The app uses <code>createImageBitmap</code>, HTML Canvas, and{' '}
              <code>canvas.toBlob()</code> to decode, resize, and re-encode
              images on your device.
            </p>
          </details>
          <details>
            <summary>Is there a file size limit or quota?</summary>
            <p>
              There is no server quota. Limits come from your browser and device
              memory. Very large images may fail if the browser runs out of
              memory.
            </p>
          </details>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__panel">
          <div className="site-footer__brand">
            <p className="eyebrow">Stay connected</p>
            <h2>HiMat Technology</h2>
            <p>
              Privacy-first web tools and high-performance applications.
              Follow along or try the hosted compressor anytime.
            </p>
            <a
              className="btn btn--primary"
              href={HIMAT_LINKS.demo}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo on himat.tech
            </a>
          </div>
          <div className="site-footer__links">
            <p className="site-footer__label">Social</p>
            <SocialLinks />
            <ul className="site-footer__meta">
              <li>
                <a
                  href={HIMAT_LINKS.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Image Compressor demo
                </a>
              </li>
              <li>
                <a
                  href={HIMAT_LINKS.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  himat.tech
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="site-footer__note">
          100% client-side · Run locally with <code>npm install</code> and{' '}
          <code>npm run dev</code>
        </p>
      </footer>
    </div>
  );
}
