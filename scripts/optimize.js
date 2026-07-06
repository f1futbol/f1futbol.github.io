import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const directoryPath = path.join(process.cwd(), 'public/catalogo');

// Recorrer el directorio recursivamente
const optimizeImages = async (dir) => {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await optimizeImages(fullPath);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        // Detectar si es una imagen no optimizada
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const newPath = fullPath.replace(ext, '.webp');
          
          console.log(`⏳ Optimizando: ${file}...`);
          
          try {
            await sharp(fullPath)
              .webp({ quality: 80 })
              .toFile(newPath);
            
            // Borrar el archivo original
            fs.unlinkSync(fullPath);
            console.log(`✅ Transformado y original eliminado: ${path.basename(newPath)}`);
          } catch (error) {
            console.error(`❌ Error al procesar ${file}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`No se pudo leer el directorio ${dir}:`, error);
  }
};

console.log('🚀 Iniciando optimización masiva de imágenes a formato WebP...');
optimizeImages(directoryPath).then(() => {
  console.log('🎉 ¡Todas las imágenes han sido optimizadas a WebP exitosamente!');
});
