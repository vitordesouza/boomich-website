import process from 'node:process';
import sharp from 'sharp';

const input = process.argv[2];

if (!input) {
  throw new Error('Usage: node scripts/portrait.mjs <input-image-path>');
}

const outputWidth = 640;
const outputHeight = 800;
const shadow = [28, 33, 24];
// Tritone: the olive-gray mid stop is what makes the portrait read as
// printed into the page rather than a neutral B&W pasted onto it.
const mid = [108, 110, 90];
const highlight = [236, 233, 220];

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
  const smooth = normalized * normalized * (3 - 2 * normalized);
  const contrast = normalized * 0.52 + smooth * 0.48;
  const outputIndex = index * 3;

  for (let channel = 0; channel < 3; channel += 1) {
    const value =
      contrast < 0.5
        ? shadow[channel] + (mid[channel] - shadow[channel]) * (contrast * 2)
        : mid[channel] +
          (highlight[channel] - mid[channel]) * ((contrast - 0.5) * 2);
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
