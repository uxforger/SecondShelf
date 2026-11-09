// Writes printable EAN-13 SVGs for the demo catalogue to docs/barcodes/.
// Usage: node scripts/barcodes.mjs
import fs from 'node:fs';
import path from 'node:path';

const CODES = {
  'cream-crackers': '2006001000016',
  'instant-noodles': '2006001000023',
  'milk-powder': '2006001000030',
  'digestive-biscuits': '2006001000047',
  'fruit-drink': '2006001000054',
};

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

function bits(code) {
  const d = code.split('').map(Number);
  const p = PARITY[d[0]];
  let s = '101';
  for (let i = 1; i <= 6; i++) s += (p[i - 1] === 'L' ? L : G)[d[i]];
  s += '01010';
  for (let i = 7; i <= 12; i++) s += R[d[i]];
  return s + '101';
}

function svg(code, label) {
  const b = bits(code);
  const m = 3; // module width
  const quiet = 11 * m;
  const w = b.length * m + quiet * 2;
  const guard = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);
  let rects = '';
  for (let i = 0; i < b.length; i++) {
    if (b[i] === '1') rects += `<rect x="${quiet + i * m}" y="20" width="${m}" height="${guard.has(i) ? 170 : 155}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 230" width="${w}" height="230">
<rect width="100%" height="100%" fill="#fff"/>
<g fill="#000">${rects}</g>
<text x="${w / 2}" y="212" font-family="monospace" font-size="22" text-anchor="middle">${code}</text>
<text x="${w / 2}" y="14" font-family="sans-serif" font-size="13" text-anchor="middle">${label}</text>
</svg>`;
}

const out = path.join(process.cwd(), 'docs', 'barcodes');
fs.mkdirSync(out, { recursive: true });
for (const [name, code] of Object.entries(CODES)) {
  fs.writeFileSync(path.join(out, `${name}.svg`), svg(code, name.replace('-', ' ')));
  console.log(name, code);
}
