// Debe coincidir con la regla de scripts/image-utils.cjs (toThumbPath).
const BASE = import.meta.env.BASE_URL;

/** URL de la imagen completa (galería). */
export const fullUrl = (src: string) => `${BASE}${src}`;

/** URL del thumb (~600px) usado en las tarjetas del catálogo. */
export const thumbUrl = (src: string) => `${BASE}${src.replace(/\.webp$/i, '.thumb.webp')}`;

/**
 * Si falta el thumb (p. ej. se olvidó correr `npm run optimizar`), cae a la
 * imagen completa en lugar de mostrar una imagen rota.
 */
export const fallbackToFull = (src: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const full = fullUrl(src);
  if (!img.src.endsWith(full)) img.src = full;
};
