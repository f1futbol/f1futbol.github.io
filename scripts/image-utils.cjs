// Lógica de imágenes compartida entre scripts/optimize.js y server/admin.cjs.
// Cada foto de producto se guarda en dos tamaños:
//   foto.webp        -> "full", lado mayor <= FULL_MAX px (galería / modal)
//   foto.thumb.webp  -> "thumb", lado menor = THUMB_SIZE px (tarjetas del catálogo)
// El frontend deriva la ruta del thumb con la misma regla (src/lib/images.ts).
const fs = require('fs');
const sharp = require('sharp');

const FULL_MAX = 1600;
const FULL_QUALITY = 80;
const THUMB_SIZE = 600;
const THUMB_QUALITY = 72;

const THUMB_SUFFIX = '.thumb.webp';

const isThumb = (file) => file.toLowerCase().endsWith(THUMB_SUFFIX);
const toThumbPath = (file) => file.replace(/\.webp$/i, THUMB_SUFFIX);

/** Guarda `input` (ruta o Buffer) como WebP con el lado mayor <= FULL_MAX. */
async function writeFull(input, outPath) {
  const tmp = `${outPath}.tmp`;
  await sharp(input)
    .rotate() // respeta la orientación EXIF de fotos de celular
    .resize({ width: FULL_MAX, height: FULL_MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_QUALITY })
    .toFile(tmp);
  fs.renameSync(tmp, outPath); // permite que input === outPath
}

/** Genera el thumb de una imagen full ya guardada. */
async function writeThumb(fullPath) {
  await sharp(fullPath)
    .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'outside', withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toFile(toThumbPath(fullPath));
}

/** true si la imagen supera FULL_MAX en alguno de sus lados. */
async function isOversized(file) {
  const { width = 0, height = 0 } = await sharp(file).metadata();
  return Math.max(width, height) > FULL_MAX;
}

module.exports = {
  FULL_MAX,
  THUMB_SIZE,
  isThumb,
  toThumbPath,
  writeFull,
  writeThumb,
  isOversized,
};
