import type { Product } from '../components/ProductCard';

export const INSTAGRAM_USER = 'f1futbol.store';
/** Link oficial de Meta que abre directo el chat (DM). No admite texto precargado. */
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_USER}`;

export const ORDER_DISCLAIMER =
  'Los productos son por encargo. El pago, la seña y el plazo de entrega se coordinan por Instagram.';

// Talles según las tablas de public/catalogo/medidas
const SIZES_BY_VERSION: Record<string, string[]> = {
  hincha: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  retro: ['S', 'M', 'L', 'XL', '2XL'],
  jugador: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  chomba: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  camiseta: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  abrigo: ['S', 'M', 'L', 'XL', '2XL'],
};
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

export const sizesFor = (product: Product) =>
  SIZES_BY_VERSION[product.version.toLowerCase()] ?? DEFAULT_SIZES;

/** Tipo de control que necesita cada adicional en el formulario. */
export type ExtraKind = 'text' | 'quantity' | 'toggle';

export interface Extra {
  label: string;
  /** Precio en pesos; null si no se pudo leer del texto (se muestra "a confirmar"). */
  price: number | null;
  perUnit: boolean;
  kind: ExtraKind;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** Convierte los `details` del producto ("+$2.500 c/u") en adicionales con precio numérico. */
export const extrasFor = (product: Product): Extra[] =>
  (product.details ?? []).map(({ label, value }) => {
    const digits = value.replace(/\D/g, '');
    const perUnit = /c\/u/i.test(value);
    const key = normalize(label);
    const kind: ExtraKind = key.startsWith('personaliz') ? 'text' : perUnit ? 'quantity' : 'toggle';
    return { label, price: digits ? Number(digits) : null, perUnit, kind };
  });

/** Lo que eligió el cliente para cada adicional, indexado por label. */
export interface ExtraSelection {
  enabled: boolean;
  /** Nombre y número (personalización) o cuáles parches. */
  note: string;
  quantity: number;
}

// Caracteres de control e invisibles: ancho cero, marcas e inversiones de dirección (RTL), BOM.
// Se conserva U+200D (unión de ancho cero) porque forma emojis compuestos.
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u00AD\u200B\u200C\u200E\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;

/**
 * Limpia texto escrito por el cliente: saltos de línea y tabs pasan a espacio (así un
 * comentario no puede imitar ítems o el total del pedido), se quitan caracteres
 * invisibles, se colapsan espacios y se corta a `max` caracteres sin partir emojis.
 */
export const cleanText = (text: string, max = Infinity) => {
  const clean = text.replace(/[\r\n\t]+/g, ' ').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
  const chars = Array.from(clean);
  return chars.length > max ? chars.slice(0, max).join('').trim() : clean;
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

const isChosen = (extra: Extra, sel?: ExtraSelection): sel is ExtraSelection =>
  !!sel && (extra.kind === 'quantity' ? sel.quantity > 0 : sel.enabled);

export interface ChosenExtra {
  /** Texto para mostrar, ej: "Parches x2: Libertadores, Liga" */
  text: string;
  /** Precio total de este adicional; null si no se pudo leer. */
  price: number | null;
}

/** Adicionales elegidos, en el orden del producto. */
export const chosenExtras = (product: Product, selections: Record<string, ExtraSelection>): ChosenExtra[] =>
  extrasFor(product).flatMap((extra) => {
    const sel = selections[extra.label];
    if (!isChosen(extra, sel)) return [];
    const units = extra.kind === 'quantity' ? sel.quantity : 1;
    const qty = extra.kind === 'quantity' ? ` x${sel.quantity}` : '';
    const noteText = cleanText(sel.note);
    const note = noteText ? `: ${noteText}` : '';
    return [{ text: `${extra.label}${qty}${note}`, price: extra.price === null ? null : extra.price * units }];
  });

/** Precio de una unidad: base + adicionales. */
export const unitPrice = (product: Product, selections: Record<string, ExtraSelection>) =>
  chosenExtras(product, selections).reduce((sum, c) => sum + (c.price ?? 0), product.basePrice);

export interface OrderLine {
  product: Product;
  size: string;
  selections: Record<string, ExtraSelection>;
  comment: string;
  quantity: number;
}

export const lineTotal = (line: OrderLine) => unitPrice(line.product, line.selections) * line.quantity;
export const orderTotal = (lines: OrderLine[]) => lines.reduce((sum, l) => sum + lineTotal(l), 0);

/** Instagram corta los DM en ~1000 caracteres: dejamos margen. */
export const MAX_MESSAGE_LENGTH = 950;

const versionLabel = (p: Product) => (p.version.toLowerCase() === 'abrigo' ? '' : ` (${p.version.toLowerCase()})`);

const lineBlock = (line: OrderLine, index: number) => {
  const { product, size, selections, comment, quantity } = line;
  const extras = chosenExtras(product, selections);
  const unit = unitPrice(product, selections);
  const rows = [
    `${index + 1}) ${product.title}${versionLabel(product)} · Talle ${size}${quantity > 1 ? ` · x${quantity}` : ''}`,
  ];
  if (extras.length) rows.push(`   + ${extras.map((e) => e.text).join(' · ')}`);
  const note = cleanText(comment);
  if (note) rows.push(`   Nota: ${note}`);
  const price = quantity > 1 ? `${formatPrice(unit)} c/u = ${formatPrice(unit * quantity)}` : formatPrice(unit);
  rows.push(`   ${price} · ref ${product.id}`);
  return rows.join('\n');
};

/**
 * Arma el pedido como uno o más mensajes de Instagram: si es muy largo se divide
 * en "Mensaje 1/n", "Mensaje 2/n"... cada uno por debajo de MAX_MESSAGE_LENGTH.
 */
export const buildOrderMessages = (lines: OrderLine[]): string[] => {
  if (!lines.length) return [];
  const units = lines.reduce((n, l) => n + l.quantity, 0);
  const intro = `¡Hola! Quiero hacer este pedido POR ENCARGO (${units} ${units === 1 ? 'producto' : 'productos'}):`;
  const footer =
    `Total estimado: ${formatPrice(orderTotal(lines))}\n` +
    'Entiendo que es por encargo: el pago, la seña y el plazo de entrega los coordinamos por acá.';
  const header = (i: number, n: number) =>
    n === 1 ? intro : i === 0 ? `${intro} [Mensaje 1/${n}]` : `Pedido por encargo (continuación) [Mensaje ${i + 1}/${n}]`;

  // Se reserva lugar para el encabezado más largo; el pie (total) va solo en el último mensaje
  const budget = MAX_MESSAGE_LENGTH - header(0, 99).length;
  const size = (blocks: string[]) => blocks.reduce((n, b) => n + b.length + 2, 0);
  const chunks: string[][] = [[]];
  lines.forEach((line, i) => {
    const block = lineBlock(line, i);
    const last = chunks[chunks.length - 1];
    if (last.length && size(last) + block.length + 2 > budget) chunks.push([block]);
    else last.push(block);
  });
  // Si el pie no entra en el último mensaje, se pasan productos a uno nuevo
  const withFooter = (blocks: string[]) => size(blocks) + footer.length + 2 <= budget;
  const last = chunks[chunks.length - 1];
  if (!withFooter(last)) {
    // Se mueven al final los productos que hagan falta para que el total entre
    const moved: string[] = [];
    while (last.length > 1 && !withFooter(last)) moved.unshift(last.pop()!);
    chunks.push(moved); // si queda vacío, el total va solo en el último mensaje
  }

  return chunks.map((blocks, i) => {
    const parts = [header(i, chunks.length), ...blocks];
    if (i === chunks.length - 1) parts.push(footer);
    return parts.join('\n\n');
  });
};

/** Copia al portapapeles. Devuelve false si el navegador no lo permite. */
export const copyText = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* sigue con el método viejo */
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
};
