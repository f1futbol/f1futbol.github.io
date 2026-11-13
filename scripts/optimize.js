// Optimiza todas las imágenes de public/catalogo. Es seguro correrlo las veces que quieras:
//  1. Convierte .jpg/.jpeg/.png a .webp (lado mayor <= 1600px) y borra el original.
//  2. Achica los .webp que superen 1600px.
//  3. En las carpetas de productos (equipos, selecciones, f1) genera el thumb
//     `foto.thumb.webp` si falta o quedó desactualizado, y borra thumbs huérfanos.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { isThumb, toThumbPath, writeFull, writeThumb, isOversized, FULL_MAX } = require('./image-utils.cjs');

const ROOT = path.join(process.cwd(), 'public/catalogo');
const PRODUCT_DIRS = ['equipos', 'selecciones', 'f1'];
const RAW_EXTS = ['.jpg', '.jpeg', '.png'];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });

const isProductImage = (file) => {
  const top = path.relative(ROOT, file).split(path.sep)[0];
  return PRODUCT_DIRS.includes(top);
};

const rel = (file) => path.relative(ROOT, file);
const stats = { converted: 0, resized: 0, thumbs: 0, orphans: 0, errors: 0 };

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  let webp = file;

  try {
    if (RAW_EXTS.includes(ext)) {
      webp = file.slice(0, -ext.length) + '.webp';
      await writeFull(file, webp);
      fs.unlinkSync(file);
      stats.converted++;
      console.log(`✅ Convertida: ${rel(webp)}`);
    } else if (ext === '.webp' && !isThumb(file)) {
      if (await isOversized(file)) {
        await writeFull(file, file);
        stats.resized++;
        console.log(`📐 Achicada a ${FULL_MAX}px: ${rel(file)}`);
      }
    } else {
      return;
    }

    if (isProductImage(webp)) {
      const thumb = toThumbPath(webp);
      if (!fs.existsSync(thumb) || fs.statSync(thumb).mtimeMs < fs.statSync(webp).mtimeMs) {
        await writeThumb(webp);
        stats.thumbs++;
      }
    }
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error al procesar ${rel(file)}:`, error.message);
  }
}

console.log('🚀 Optimizando imágenes de public/catalogo...');
const files = walk(ROOT);

// Thumbs cuya imagen original ya no existe
for (const file of files.filter(isThumb)) {
  const source = file.slice(0, -'.thumb.webp'.length) + '.webp';
  if (!fs.existsSync(source)) {
    fs.unlinkSync(file);
    stats.orphans++;
    console.log(`🗑️  Thumb huérfano borrado: ${rel(file)}`);
  }
}

// Procesar en paralelo de a 4 (sharp ya usa varios hilos por imagen)
const queue = files.filter((f) => !isThumb(f));
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) await processFile(queue.shift());
  })
);

console.log(
  `🎉 Listo. Convertidas: ${stats.converted} · Achicadas: ${stats.resized} · ` +
    `Thumbs generados: ${stats.thumbs} · Thumbs huérfanos borrados: ${stats.orphans} · Errores: ${stats.errors}`
);
if (stats.errors) process.exitCode = 1;
