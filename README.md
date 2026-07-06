# F1Futbol - Tienda Online 🛒🏎️

Catálogo de comercio electrónico de alto rendimiento diseñado con **React.js, TypeScript y Tailwind CSS**. Presenta un enfoque *Mobile-First*, sistema avanzado de filtrado modal, y optimizaciones de rendimiento como *Scroll Reveal* para las imágenes de los productos.

---

## 🚀 Instalación y Uso Local

Para correr este proyecto en tu propia computadora y ver los cambios en tiempo real, sigue estos pasos:

### 1. Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu equipo.

### 2. Instalar dependencias
Abre la terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Iniciar el servidor local
Una vez instaladas las dependencias, levanta el servidor de desarrollo con:
```bash
npm run dev
```
La consola te mostrará una dirección local (usualmente `http://localhost:5173/`). Abre ese enlace en tu navegador para ver la web.

### 4. Compilar para Producción
Antes de subir los cambios a GitHub Pages, asegúrate de que el proyecto compila correctamente sin errores de TypeScript:
```bash
npm run build
```

---

## 📦 Cómo agregar un nuevo producto (Paso a Paso)

### Paso 1: Descargar las fotos
1. Ingresa a la galería de tu proveedor.
2. Descarga entre **4 y 6 fotos** de alta calidad de la nueva camiseta (Frente, dorso, cuello, tela, etc).
3. Guárdalas en la carpeta correspondiente dentro del repositorio según sea equipo o selección:
   - Equipos: `public/catalogo/equipos/[nombre-del-equipo]/`
   - Selecciones: `public/catalogo/selecciones/[nombre-del-pais]/`
4. Nombralas de forma simple y secuencial (ej: `madrid-titular-1.jpg`, `madrid-titular-2.jpg`).

### Paso 2: Optimización de Imágenes
Abre la terminal en tu editor y ejecuta el siguiente comando para que las fotos crudas se conviertan automáticamente a formato WebP (más rápido y ligero) y se eliminen los originales pesados:
```bash
npm run optimizar
```

### Paso 3: Instrucción de Carga
Abre el chat con el asistente en el entorno de desarrollo y envíale un mensaje con la instrucción de carga. Debe contener:
- Cantidad de fotos subidas y ubicación.
- Equipo.
- Versión (ej: Jugador, Fan, Retro).
- Textos descriptivos para cada foto en orden (ej: 1 Frente, 2 Dorso, etc).
- Precio base.
- Adicionales a incluir (Solo nombrarlos, ej: Personalización, Parches, Sponsor, Manga larga. Los precios ya están fijados en el sistema).

**Ejemplo de mensaje:**
> *"Subí 5 fotos de la camiseta del Real Madrid Titular a la carpeta de public/catalogo/equipos/realmadrid y ya ejecuté npm run optimizar. Agrégalo al catálogo como versión 'jugador' y precio 60000. Adicionales: parches y personalización. Orden de fotos: frente, dorso, manga, tela, logo."*

### Paso 4: Sincronización Automática
El asistente modificará el archivo `src/data/products.json` generando la tarjeta del producto, configurando el carrusel y conectando el botón de compra a Instagram.

Verás el cambio reflejado instantáneamente en tu servidor local. Si está todo correcto, realiza el commit y empuja los cambios para que se publiquen.
