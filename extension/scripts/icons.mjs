// Renders icons/icon.svg to the PNG sizes Chrome needs:
//   npm run icons
// The PNGs are committed, so this only needs re-running when the SVG changes.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
const svg = readFileSync(join(dir, 'icon.svg'));

for (const size of [16, 32, 48, 128]) {
  // Rasterise at 4x (512px) then downsample, for cleaner small sizes.
  await sharp(svg, { density: 288 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(dir, `icon-${size}.png`));
  console.log(`icons/icon-${size}.png`);
}
