// Resize repo photos to WebP (no filters) and render PWA icons from the logo.
// Run once after adding images: npx -p playwright node scripts/optimise-images.mjs .
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const repo = process.argv[2];
const imgDir = path.join(repo, 'public/images');
const outDir = path.join(imgDir, 'opt');
const iconDir = path.join(repo, 'public/icons');
const browser = await chromium.launch();
const page = await browser.newPage();

for (const f of fs.readdirSync(imgDir).filter((x) => x.endsWith('.jpg'))) {
  const b64 = fs.readFileSync(path.join(imgDir, f)).toString('base64');
  for (const w of [640, 1280]) {
    const data = await page.evaluate(async ({ b64, w }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await img.decode();
      const scale = Math.min(1, w / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.8).split(',')[1];
    }, { b64, w });
    const out = path.join(outDir, f.replace('.jpg', `-${w}.webp`));
    fs.writeFileSync(out, Buffer.from(data, 'base64'));
    console.log(out, fs.statSync(out).size);
  }
}

const svg = fs.readFileSync(path.join(repo, 'public/logo.svg'), 'utf8');
for (const [name, size, pad, bg] of [
  ['icon-192.png', 192, 0.16, '#F6F8F3'],
  ['icon-512.png', 512, 0.16, '#F6F8F3'],
  ['maskable-512.png', 512, 0.26, '#F6F8F3'],
]) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - pad * 2));
  await page.setContent(
    `<html><body style="margin:0;background:${bg};display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">` +
      svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `) +
      '</body></html>',
  );
  await page.screenshot({ path: path.join(iconDir, name), omitBackground: false });
  console.log(name);
}
await browser.close();
