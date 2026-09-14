# HiMat Image Compressor & WebP/AVIF Converter

Privacy-first, browser-based image compression, resizing, and format conversion. All processing happens locally in your browser — images are never uploaded to a server.

**Live demo:** [himat.tech/free-tools/image-compressor](https://himat.tech/free-tools/image-compressor)

## Connect with HiMat Technology

| Platform | Link |
|----------|------|
| **Live demo** | [Image Compressor tool](https://himat.tech/free-tools/image-compressor) |
| **Website** | [himat.tech](https://himat.tech) |
| **Facebook** | [Himat Technology](https://www.facebook.com/people/Himat-technology/61593829197445/) |
| **LinkedIn** | [himat-technology](https://www.linkedin.com/company/himat-technology) |
| **Instagram** | [@himat_technology](https://www.instagram.com/himat_technology/) |

## Features

- Upload JPEG/JPG, PNG, WebP, and AVIF (click, drag-and-drop, multi-file batch)
- Convert to WebP (default), JPEG, PNG, or AVIF (when the browser can encode it)
- Quality slider (1–100%, default 80%) for lossy formats
- Optional max width/height with aspect-ratio lock (no unnecessary upscaling)
- Side-by-side original vs compressed previews with real file-size stats
- Per-image download, Copy Base64, and Download All (ZIP)
- Clear / remove with `URL.revokeObjectURL()` cleanup
- Responsive, accessible UI

## Technology stack

- React 19 + TypeScript (strict)
- Vite 6
- JSZip (client-side ZIP only)
- Vitest for utility tests

No backend. No image upload APIs.

## How image processing works

1. Read the selected `File`
2. Decode with `createImageBitmap()` (fallback: `HTMLImageElement`)
3. Measure original dimensions
4. Calculate target size from optional max width/height
5. Draw onto an offscreen HTML canvas with high-quality smoothing
6. Encode with `canvas.toBlob()` / `OffscreenCanvas.convertToBlob()`
7. Create an object URL, compute sizes, show preview, enable download

PNG output is lossless; the quality slider does not apply to PNG.

## Privacy architecture

- Processing runs entirely in the browser
- No image bytes are sent to backends, APIs, cloud storage, or analytics
- Generated Blobs stay in memory until you download or clear them
- Object URLs are revoked when items are removed or the app unmounts

Claims such as **100% Browser-Local Processing** and **Zero Server Uploads** are technically true for this repository.

## Supported formats

| Direction | Formats |
|-----------|---------|
| Input | JPEG/JPG, PNG, WebP, AVIF (decode depends on browser) |
| Output | WebP, JPEG, PNG, AVIF (encode depends on browser) |

### AVIF limitations

- **Decoding**: available in modern Chromium, Firefox, and Safari versions that support AVIF images.
- **Encoding**: only offered when `canvas.toBlob('image/avif')` succeeds in a capability check.
- If encoding is unavailable, the AVIF option is disabled with an explicit message. The app does not pretend AVIF encoding worked.

## Local setup

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

Compare with the hosted experience: [Live demo on himat.tech](https://himat.tech/free-tools/image-compressor).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Typecheck and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint |
| `npm run smoke` | Headless browser smoke test (requires `npx playwright install chromium`, then `npm run preview` on port 4173) |

## Browser compatibility

Works in current Chromium, Firefox, and Safari/WebKit browsers with Canvas and Blob support.

Feature detection covers:

- `createImageBitmap`
- `canvas.toBlob`
- WebP / JPEG / PNG / AVIF encode
- AVIF decode
- Clipboard API (for Base64 copy)

## Project structure

```text
src/
  components/     Upload, settings, previews, controls
  hooks/          useImageProcessor orchestration
  lib/            Pure processing, encode, resize, ZIP, Base64 helpers
  types/          Shared TypeScript types
  styles/         Application CSS
```

## License

MIT — see [LICENSE](./LICENSE).

---

Built by [HiMat Technology](https://himat.tech) · [Facebook](https://www.facebook.com/people/Himat-technology/61593829197445/) · [LinkedIn](https://www.linkedin.com/company/himat-technology) · [Instagram](https://www.instagram.com/himat_technology/)
