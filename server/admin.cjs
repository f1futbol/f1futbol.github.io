const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
app.use(cors());
app.use(express.json());

const productsFile = path.join(__dirname, '../src/data/products.json');

// Usar memoria en lugar de disco para poder optimizar con Sharp antes de guardar
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/upload', upload.array('images'), async (req, res) => {
  const storeMode = req.body.storeMode || 'equipos';
  const team = (req.body.team || 'otros').toLowerCase().replace(/\s+/g, '');
  
  const dir = path.join(__dirname, '../public/catalogo', storeMode, team);
  
  // Crear el directorio si no existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const filePaths = [];

    for (const file of req.files) {
      // Generar nombre base sin extensión y forzar .webp
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/\s+/g, '_');
      const filename = `${basename}.webp`;
      const fullPath = path.join(dir, filename);

      // Optimizar y convertir a WebP automáticamente
      await sharp(file.buffer)
        .webp({ quality: 80 })
        .toFile(fullPath);

      // Calcular la ruta relativa para guardar en el JSON
      const relPath = `catalogo/${storeMode}/${team}/${filename}`;
      filePaths.push(relPath);
    }
    
    res.json({ filePaths });
  } catch (error) {
    console.error('Error al optimizar imágenes:', error);
    res.status(500).json({ error: 'Fallo al procesar las imágenes' });
  }
});

app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  try {
    let products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    
    // Asignar un ID único basado en el timestamp
    newProduct.id = Date.now().toString();
    
    // Insertar al principio para que quede arriba de todo
    products.unshift(newProduct);
    
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo al guardar el producto' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor de Administración local corriendo en http://localhost:${PORT}`);
});
