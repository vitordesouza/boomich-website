import process from 'node:process';
import sharp from 'sharp';

const input = process.argv[2];

if (!input) {
  throw new Error('Usage: node scripts/portrait.mjs <input-image-path>');
}

const outputWidth = 640;
const outputHeight = 800;
// Duotone with hard levels: everything below BLACK_POINT crushes to the deep
// olive shadow, everything above WHITE_POINT blows to warm ink. Both stops
// stay olive-tinted so the print belongs to the page; the clip is what gives
// it punch.
const shadow = [18, 22, 13];
const highlight = [238, 235, 219];
const BLACK_POINT = 0.16;
const WHITE_POINT = 0.82;

const metadata = await sharp(input).metadata();
if (!metadata.width || !metadata.height) {
  throw new Error('The input image must have readable dimensions.');
}

const cropHeight = Math.min(metadata.height, Math.round(metadata.width * 1.25));
const cropTop = Math.min(
  metadata.height - cropHeight,
  Math.round(metadata.height * 0.04),
);

const { data, info } = await sharp(input)
  .extract({ left: 0, top: cropTop, width: metadata.width, height: cropHeight })
  .resize(outputWidth, outputHeight, { fit: 'fill' })
  .grayscale()
  .normalize()
  .raw()
  .toBuffer({ resolveWithObject: true });

const duotone = Buffer.alloc(info.width * info.height * 3);
for (let index = 0; index < data.length; index += 1) {
  const normalized = data[index] / 255;
  const leveled = Math.min(
    1,
    Math.max(0, (normalized - BLACK_POINT) / (WHITE_POINT - BLACK_POINT)),
  );
  const contrast = leveled * leveled * (3 - 2 * leveled);
  const outputIndex = index * 3;

  for (let channel = 0; channel < 3; channel += 1) {
    const value =
      shadow[channel] + (highlight[channel] - shadow[channel]) * contrast;
    duotone[outputIndex + channel] = Math.round(value);
  }
}

const image = sharp(duotone, {
  raw: { width: info.width, height: info.height, channels: 3 },
});

await Promise.all([
  image.clone().avif({ quality: 54, effort: 6 }).toFile('public/portrait.avif'),
  image.clone().webp({ quality: 72 }).toFile('public/portrait.webp'),
]);

console.log(
  `Generated portrait.avif and portrait.webp (${info.width}×${info.height}, crop top ${cropTop}px).`,
);
