/**
 * Headless smoke test against the Vite preview server.
 * Creates canvas-based JPEG/PNG/WebP blobs in the browser and exercises processing.
 */
import { chromium } from 'playwright';

const BASE = process.env.APP_URL ?? 'http://127.0.0.1:4173';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', (err) => {
    errors.push(String(err));
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });

  const title = await page.title();
  if (!title.includes('Image Compressor')) {
    throw new Error(`Unexpected title: ${title}`);
  }

  await page.getByRole('radio', { name: /WebP/i }).waitFor({ timeout: 15_000 });

  const expectedHrefs = [
    'https://himat.tech/free-tools/image-compressor',
    'https://www.facebook.com/people/Himat-technology/61593829197445/',
    'https://www.linkedin.com/company/himat-technology',
    'https://www.instagram.com/himat_technology/',
    'https://himat.tech',
  ];

  for (const href of expectedHrefs) {
    const link = page.locator(`a[href="${href}"]`).first();
    if ((await link.count()) === 0) {
      throw new Error(`Missing link: ${href}`);
    }
  }

  const liveDemo = page.getByRole('link', { name: /Live demo/i }).first();
  await liveDemo.waitFor();
  const demoHref = await liveDemo.getAttribute('href');
  if (demoHref !== 'https://himat.tech/free-tools/image-compressor') {
    throw new Error(`Unexpected live demo href: ${demoHref}`);
  }

  console.log('Links validation passed.');

  const files = await page.evaluate(async () => {
    async function canvasToFile(type, name, quality) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('no ctx');
      }
      ctx.fillStyle = '#1f6f66';
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText(name, 24, 120);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error(`toBlob failed for ${type}`));
              return;
            }
            resolve(result);
          },
          type,
          quality,
        );
      });

      const buffer = Array.from(new Uint8Array(await blob.arrayBuffer()));
      return { name, mime: blob.type || type, buffer };
    }

    const jpeg = await canvasToFile('image/jpeg', 'smoke.jpg', 0.92);
    const png = await canvasToFile('image/png', 'smoke.png');
    const webp = await canvasToFile('image/webp', 'smoke.webp', 0.85);
    return [jpeg, png, webp];
  });

  await page.setInputFiles(
    'input[type="file"]',
    files.map((file) => ({
      name: file.name,
      mimeType: file.mime,
      buffer: Buffer.from(file.buffer),
    })),
  );

  await page.getByRole('heading', { name: /3 images selected/i }).waitFor({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Process images' }).click();

  try {
    await page
      .getByText(/Processed 3 images successfully|Image processed successfully/i)
      .waitFor({ timeout: 30_000 });
  } catch (error) {
    const bodyText = await page.locator('body').innerText();
    console.error('Page text at failure:\n', bodyText.slice(0, 4000));
    throw error;
  }

  const downloadButtons = page.getByRole('button', { name: 'Download', exact: true });
  const count = await downloadButtons.count();
  if (count < 3) {
    throw new Error(`Expected 3 download buttons, found ${count}`);
  }

  await page.locator('input[type="range"]').evaluate((el) => {
    el.value = '50';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.getByRole('button', { name: 'Process images' }).click();
  await page
    .getByText(/Processed 3 images successfully/i)
    .waitFor({ timeout: 30_000 });

  const zip = page.getByRole('button', { name: /Download All/i });
  if (!(await zip.isEnabled())) {
    throw new Error('ZIP download should be enabled');
  }

  await page.getByRole('button', { name: /Copy Base64/i }).first().click();

  // Resize + reprocess
  await page.getByLabel('Max Width (px)').fill('160');
  await page.getByRole('button', { name: 'Process images' }).click();
  await page
    .getByText(/Processed 3 images successfully/i)
    .waitFor({ timeout: 30_000 });

  const resizedMeta = await page.locator('.preview-pane').nth(1).locator('dd').first().innerText();
  if (!/160\s*×/.test(resizedMeta)) {
    throw new Error(`Expected resized width 160, got: ${resizedMeta}`);
  }

  // AVIF encode path when the browser supports it
  const avifRadio = page.getByRole('radio', { name: /AVIF/i });
  if (await avifRadio.isEnabled()) {
    await avifRadio.check();
    await page.getByRole('button', { name: 'Process images' }).click();
    await page
      .getByText(/Processed 3 images successfully/i)
      .waitFor({ timeout: 30_000 });
    const formatText = await page.locator('.preview-pane').nth(1).locator('dd').nth(1).innerText();
    if (formatText.trim() !== 'AVIF') {
      throw new Error(`Expected AVIF output, got: ${formatText}`);
    }
  }

  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByText(/Cleared all images/i).waitFor();

  // Invalid file should be rejected gracefully
  await page.setInputFiles('input[type="file"]', {
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await page.getByText(/unsupported file type|were skipped/i).waitFor({
    timeout: 10_000,
  });

  if (errors.length > 0) {
    throw new Error(`Page errors: ${errors.join('; ')}`);
  }

  console.log('Smoke validation passed.');
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
