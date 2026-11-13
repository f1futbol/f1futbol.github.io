// Carrito sin backend: vive en memoria, se guarda en localStorage y se sincroniza
// entre pestañas. Los componentes lo leen con `useCart()`.
import { useSyncExternalStore } from 'react';
import productsData from '../data/products.json';
import type { Product } from '../components/ProductCard';
import { cleanText, type ExtraSelection } from './order';

/** Opciones que el cliente eligió para un producto. */
export interface ItemOptions {
  size: string;
  selections: Record<string, ExtraSelection>;
  comment: string;
  quantity: number;
}

export interface CartItem extends ItemOptions {
  key: string;
  productId: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** El cliente ya copió el pedido para Instagram (se borra si cambia el carrito). */
  sent: boolean;
}

const STORAGE_KEY = 'f1futbol-cart-v1';
const SENT_KEY = 'f1futbol-cart-sent-v1';
export const MAX_QUANTITY = 10;
export const MAX_PATCHES = 5;
// Límites de texto (los mismos que el formulario)
export const MAX_NOTE = 80;
export const MAX_COMMENT = 200;

const productsById = new Map((productsData as Product[]).map((p) => [p.id, p]));
export const findProduct = (id: string) => productsById.get(id);

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

const clampInt = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;

const cleanSelection = (x: unknown): ExtraSelection => {
  const s = isRecord(x) ? x : {};
  return {
    enabled: s.enabled === true,
    note: typeof s.note === 'string' ? cleanText(s.note, MAX_NOTE) : '',
    quantity: clampInt(s.quantity, 0, MAX_PATCHES, 0),
  };
};

/**
 * Normaliza cualquier dato (del formulario o de localStorage) a opciones válidas:
 * tipos correctos, cantidades acotadas, textos limpios y con largo máximo.
 * Devuelve null si no se puede rescatar (ej. sin talle).
 */
const cleanOptions = (x: unknown): ItemOptions | null => {
  if (!isRecord(x)) return null;
  const size = typeof x.size === 'string' ? cleanText(x.size, 5) : '';
  if (!size) return null;
  const selections: Record<string, ExtraSelection> = {};
  if (isRecord(x.selections)) for (const [label, sel] of Object.entries(x.selections)) selections[label] = cleanSelection(sel);
  return {
    size,
    selections,
    comment: typeof x.comment === 'string' ? cleanText(x.comment, MAX_COMMENT) : '',
    quantity: clampInt(x.quantity, 1, MAX_QUANTITY, 1),
  };
};

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Lee el carrito guardado. Nunca tira error: descarta lo ilegible, productos que ya
// no están en el catálogo, y corrige claves repetidas o datos fuera de rango.
const loadItems = (): CartItem[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const keys = new Set<string>();
    return parsed.flatMap((raw) => {
      if (!isRecord(raw) || typeof raw.productId !== 'string' || !productsById.has(raw.productId)) return [];
      const options = cleanOptions(raw);
      if (!options) return [];
      const key = typeof raw.key === 'string' && raw.key && !keys.has(raw.key) ? raw.key : newKey();
      keys.add(key);
      return [{ ...options, key, productId: raw.productId }];
    });
  } catch {
    return [];
  }
};

const loadSent = () => {
  try {
    return localStorage.getItem(SENT_KEY) === '1';
  } catch {
    return false;
  }
};

let state: CartState = { items: loadItems(), isOpen: false, sent: loadSent() };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const save = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* modo privado o storage lleno: el carrito sigue funcionando en memoria */
  }
};

const setState = (patch: Partial<CartState>) => {
  state = { ...state, ...patch };
  if (patch.items) save(STORAGE_KEY, JSON.stringify(state.items));
  if (patch.sent !== undefined) save(SENT_KEY, patch.sent ? '1' : null);
  notify();
};

/** Cualquier cambio en los productos invalida el "ya lo enviaste". */
const setItems = (items: CartItem[], extra: Partial<CartState> = {}) => setState({ items, sent: false, ...extra });

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Si el carrito cambia en otra pestaña, actualizar esta
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY && e.key !== SENT_KEY) return;
    state = { ...state, items: loadItems(), sent: loadSent() };
    notify();
  });
}

export const cart = {
  add(productId: string, options: ItemOptions) {
    const clean = cleanOptions(options);
    if (!clean || !productsById.has(productId)) return;
    setItems([...state.items, { ...clean, productId, key: newKey() }], { isOpen: true });
  },
  update(key: string, options: ItemOptions) {
    const clean = cleanOptions(options);
    if (!clean) return;
    setItems(state.items.map((i) => (i.key === key ? { ...i, ...clean } : i)));
  },
  setQuantity(key: string, quantity: number) {
    setItems(state.items.map((i) => (i.key === key ? { ...i, quantity: clampInt(quantity, 1, MAX_QUANTITY, i.quantity) } : i)));
  },
  remove(key: string) {
    setItems(state.items.filter((i) => i.key !== key));
  },
  clear() {
    setItems([]);
  },
  markSent() {
    if (state.items.length) setState({ sent: true });
  },
  open() {
    setState({ isOpen: true });
  },
  close() {
    setState({ isOpen: false });
  },
};

export const useCart = () => useSyncExternalStore(subscribe, () => state);
