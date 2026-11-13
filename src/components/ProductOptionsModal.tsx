import { useMemo, useState } from 'react';
import type { Product } from './ProductCard';
import { thumbUrl, fallbackToFull } from '../lib/images';
import { extrasFor, formatPrice, sizesFor, unitPrice, type Extra, type ExtraSelection } from '../lib/order';
import { MAX_COMMENT, MAX_NOTE, MAX_PATCHES, MAX_QUANTITY, type ItemOptions } from '../lib/cart';
import { useEscape, useScrollLock } from '../lib/useScrollLock';

interface ProductOptionsModalProps {
  product: Product;
  /** Valores iniciales al editar un producto que ya está en el carrito. */
  initial?: ItemOptions;
  submitLabel: string;
  onSubmit: (options: ItemOptions) => void;
  onClose: () => void;
}

const EMPTY: ExtraSelection = { enabled: false, note: '', quantity: 0 };

const Stepper = ({
  value, min, max, label, onChange,
}: { value: number; min: number; max: number; label: string; onChange: (n: number) => void }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      aria-label={`Quitar ${label}`}
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
      className="w-8 h-8 rounded-lg bg-gray-800 text-white font-bold disabled:opacity-30"
    >
      −
    </button>
    <span className="w-5 text-center font-bold text-white" aria-live="polite">{value}</span>
    <button
      type="button"
      aria-label={`Agregar ${label}`}
      disabled={value >= max}
      onClick={() => onChange(value + 1)}
      className="w-8 h-8 rounded-lg bg-gray-800 text-white font-bold disabled:opacity-30"
    >
      +
    </button>
  </div>
);

const inputClass =
  'w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none';

/** Formulario de talle, adicionales y cantidad. Se monta solo mientras está abierto. */
export const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({
  product, initial, submitLabel, onSubmit, onClose,
}) => {
  const extras = useMemo(() => extrasFor(product), [product]);
  const sizes = useMemo(() => sizesFor(product), [product]);

  const [size, setSize] = useState(initial?.size ?? '');
  const [selections, setSelections] = useState<Record<string, ExtraSelection>>(initial?.selections ?? {});
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [sizeError, setSizeError] = useState(false);

  useScrollLock(true);
  useEscape(true, onClose);

  const unit = unitPrice(product, selections);

  const update = (label: string, patch: Partial<ExtraSelection>) =>
    setSelections((prev) => ({ ...prev, [label]: { ...EMPTY, ...prev[label], ...patch } }));

  const submit = () => {
    if (!size) {
      setSizeError(true);
      document.getElementById('options-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit({ size, selections, comment: comment.trim(), quantity });
  };

  const priceTag = (extra: Extra) =>
    extra.price === null ? ' (a confirmar)' : ` (+${formatPrice(extra.price)}${extra.perUnit ? ' c/u' : ''})`;

  return (
    <div className="fixed inset-0 z-[130] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-title"
        className="relative bg-card border border-gray-800 rounded-t-3xl md:rounded-3xl w-full md:w-[520px] md:max-w-[92vw] max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Encabezado */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-800">
          {product.images[0] && (
            <img
              src={thumbUrl(product.images[0].src)}
              onError={fallbackToFull(product.images[0].src)}
              alt=""
              className="w-16 h-16 rounded-lg object-cover flex-none bg-black"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 id="options-title" className="text-white font-bold leading-tight line-clamp-2">
              {product.title}
            </h2>
            <p className="text-xs text-gray-400 capitalize mt-0.5">
              {product.version.toLowerCase() === 'abrigo' ? 'Abrigo' : `Versión ${product.version}`} ·{' '}
              <span className="text-accent font-bold">{formatPrice(product.basePrice)}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-white text-3xl leading-none self-start">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {/* Talle */}
          <fieldset id="options-sizes">
            <legend className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
              Talle <span className="text-accent">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => { setSize(s); setSizeError(false); }}
                  className={`min-w-12 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    size === s
                      ? 'bg-accent text-white shadow-lg shadow-accent/30'
                      : 'bg-dark text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="text-sm text-red-400 mt-2">Elegí un talle para continuar.</p>}
            <p className="text-xs text-gray-500 mt-2">Las medidas de cada talle están en la sección “Talles”.</p>
          </fieldset>

          {/* Adicionales */}
          {extras.length > 0 && (
            <fieldset>
              <legend className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
                Adicionales (opcional)
              </legend>
              <div className="space-y-3">
                {extras.map((extra) => {
                  const sel = selections[extra.label] ?? EMPTY;
                  const id = `extra-${product.id}-${extra.label}`;
                  const label = (
                    <span className="text-sm text-gray-200">
                      {extra.label}
                      <span className="text-gray-500">{priceTag(extra)}</span>
                    </span>
                  );

                  if (extra.kind === 'quantity') {
                    return (
                      <div key={extra.label} className="bg-dark/60 rounded-xl p-3 border border-gray-800">
                        <div className="flex items-center justify-between gap-3">
                          {label}
                          <Stepper
                            value={sel.quantity}
                            min={0}
                            max={MAX_PATCHES}
                            label={extra.label}
                            onChange={(n) => update(extra.label, { quantity: n })}
                          />
                        </div>
                        {sel.quantity > 0 && (
                          <input
                            type="text"
                            value={sel.note}
                            onChange={(e) => update(extra.label, { note: e.target.value })}
                            placeholder="¿Cuáles? (ej: Libertadores, Liga)"
                            maxLength={MAX_NOTE}
                            className={`mt-3 ${inputClass}`}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={extra.label} className="bg-dark/60 rounded-xl p-3 border border-gray-800">
                      <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          id={id}
                          type="checkbox"
                          checked={sel.enabled}
                          onChange={(e) => update(extra.label, { enabled: e.target.checked })}
                          className="w-5 h-5 accent-accent"
                        />
                        {label}
                      </label>
                      {extra.kind === 'text' && sel.enabled && (
                        <input
                          type="text"
                          value={sel.note}
                          onChange={(e) => update(extra.label, { note: e.target.value })}
                          placeholder="Nombre y número (ej: MESSI 10)"
                          maxLength={40}
                          autoFocus={!initial}
                          className={`mt-3 ${inputClass}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Comentario libre */}
          <div>
            <label htmlFor={`comment-${product.id}`} className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
              Comentario (opcional)
            </label>
            <textarea
              id={`comment-${product.id}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={MAX_COMMENT}
              placeholder="Ej: es para regalo, ¿tienen talle de niño?"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Pie: cantidad, precio y confirmar */}
        <div className="p-5 border-t border-gray-800 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Cantidad</span>
              <Stepper value={quantity} min={1} max={MAX_QUANTITY} label="unidad" onChange={setQuantity} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-accent leading-none">{formatPrice(unit * quantity)}</div>
              {quantity > 1 && <div className="text-xs text-gray-500 mt-1">{formatPrice(unit)} c/u</div>}
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            className="w-full bg-accent hover:brightness-110 text-white py-3.5 rounded-xl font-black tracking-wide transition-all shadow-lg shadow-accent/30"
          >
            {submitLabel}
          </button>
          <p className="text-xs text-center text-gray-500">Producto por encargo · No se cobra nada online</p>
        </div>
      </div>
    </div>
  );
};
