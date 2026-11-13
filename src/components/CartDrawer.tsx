import { useCallback, useMemo, useState } from 'react';
import { InstagramIcon } from './InstagramIcon';
import { ProductOptionsModal } from './ProductOptionsModal';
import { thumbUrl, fallbackToFull } from '../lib/images';
import { cart, findProduct, useCart, MAX_QUANTITY, type CartItem } from '../lib/cart';
import { useEscape, useScrollLock } from '../lib/useScrollLock';
import {
  INSTAGRAM_DM_URL,
  INSTAGRAM_USER,
  ORDER_DISCLAIMER,
  buildOrderMessages,
  chosenExtras,
  copyText,
  formatPrice,
  lineTotal,
  orderTotal,
  type OrderLine,
} from '../lib/order';

type Line = OrderLine & { item: CartItem };

export const CartDrawer = () => {
  const { items, isOpen, sent } = useCart();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Mensajes ya copiados (por texto: si el pedido cambia, se "desmarcan" solos)
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const lines: Line[] = useMemo(
    () =>
      items.flatMap((item) => {
        const product = findProduct(item.productId);
        return product ? [{ ...item, product, item }] : [];
      }),
    [items]
  );
  const messages = useMemo(() => buildOrderMessages(lines), [lines]);
  const total = orderTotal(lines);
  const units = lines.reduce((n, l) => n + l.quantity, 0);
  const anyCopied = messages.some((m) => copied[m] === true);
  const editing = lines.find((l) => l.item.key === editingKey);

  const close = useCallback(() => cart.close(), []);
  const stopEditing = useCallback(() => setEditingKey(null), []);
  useScrollLock(isOpen);
  useEscape(isOpen && !editing, close);

  // El link navega solo (así el navegador no lo bloquea como popup) y en el mismo clic copia el mensaje
  const copyMessage = async (message: string) => {
    const ok = await copyText(message);
    setCopied((prev) => ({ ...prev, [message]: ok }));
    // Queda guardado: si el celular recarga la página al volver de Instagram, sigue el "¿Ya lo enviaste?"
    if (ok) cart.markSent();
  };

  const clearCart = () => {
    cart.clear();
    setCopied({});
    cart.close();
  };

  return (
    <>
      {/* Fondo */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        inert={!isOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-card border-l border-gray-800 z-[110] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-xl font-black text-white italic">
            Tu pedido {units > 0 && <span className="text-accent">({units})</span>}
          </h2>
          <button onClick={close} aria-label="Cerrar carrito" className="text-gray-400 hover:text-white text-3xl leading-none">
            &times;
          </button>
        </div>

        {/* Aviso por encargo */}
        <div className="mx-5 mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-gray-200">
          <span className="font-black text-white">📦 Pedido por encargo.</span> {ORDER_DISCLAIMER} No se cobra nada en la web.
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <p className="text-gray-400">Todavía no agregaste productos.</p>
            <button onClick={close} className="text-accent font-bold hover:text-white transition-colors">
              Ver el catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Productos */}
            <ul className="flex-1 overflow-y-auto p-5 space-y-4">
              {lines.map((line) => {
                const { product, item } = line;
                const extras = chosenExtras(product, item.selections);
                return (
                  <li key={item.key} className="flex gap-3 bg-dark/60 rounded-xl p-3 border border-gray-800">
                    {product.images[0] && (
                      <img
                        src={thumbUrl(product.images[0].src)}
                        onError={fallbackToFull(product.images[0].src)}
                        alt=""
                        loading="lazy"
                        className="w-20 h-20 rounded-lg object-cover flex-none bg-black"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white leading-tight line-clamp-2">{product.title}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {product.version.toLowerCase() === 'abrigo' ? 'Abrigo' : product.version} · Talle{' '}
                        <span className="text-white font-bold">{item.size}</span>
                      </p>
                      {extras.map((e) => (
                        <p key={e.text} className="text-xs text-gray-300 mt-0.5 break-words">
                          + {e.text}
                          {e.price !== null && <span className="text-gray-500"> (+{formatPrice(e.price)})</span>}
                        </p>
                      ))}
                      {item.comment && <p className="text-xs text-gray-500 italic mt-0.5 break-words">“{item.comment}”</p>}

                      <div className="flex items-center justify-between mt-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            aria-label="Restar uno"
                            disabled={item.quantity <= 1}
                            onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                            className="w-7 h-7 rounded-md bg-gray-800 text-white font-bold disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-white">{item.quantity}</span>
                          <button
                            aria-label="Sumar uno"
                            disabled={item.quantity >= MAX_QUANTITY}
                            onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
                            className="w-7 h-7 rounded-md bg-gray-800 text-white font-bold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-black text-accent">{formatPrice(lineTotal(line))}</span>
                      </div>

                      <div className="flex gap-4 mt-2 text-xs font-semibold">
                        <button onClick={() => setEditingKey(item.key)} className="text-gray-400 hover:text-white">
                          Editar
                        </button>
                        <button onClick={() => cart.remove(item.key)} className="text-gray-400 hover:text-red-400">
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pie: total y envío */}
            <div className="p-5 border-t border-gray-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-400 text-sm">Total estimado</span>
                <span className="text-2xl font-black text-accent">{formatPrice(total)}</span>
              </div>

              {messages.length > 1 && (
                <p className="text-xs text-gray-400">
                  Tu pedido es largo y Instagram corta los mensajes, así que se envía en {messages.length} partes:
                  copiá y pegá cada una en orden.
                </p>
              )}

              {messages.map((message, i) => (
                <a
                  key={i}
                  href={INSTAGRAM_DM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void copyMessage(message)}
                  className="w-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white py-3.5 rounded-xl font-black tracking-wide flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <InstagramIcon />
                  {copied[message] ? '✓ ' : ''}
                  {messages.length === 1 ? 'Enviar pedido por Instagram' : `Enviar parte ${i + 1} de ${messages.length}`}
                </a>
              ))}

              <p className="text-xs text-center text-gray-400" aria-live="polite">
                {messages.some((m) => copied[m] === false) ? (
                  <span className="text-red-400">No se pudo copiar automáticamente: abrí “Ver mensaje” y copialo a mano.</span>
                ) : anyCopied ? (
                  <span className="text-green-400 font-semibold">✓ Copiado. Pegalo en el chat con @{INSTAGRAM_USER} y envialo.</span>
                ) : (
                  `Se copia tu pedido y se abre el chat con @${INSTAGRAM_USER}: solo tenés que pegarlo y enviarlo.`
                )}
              </p>

              <details className="text-sm">
                <summary className="cursor-pointer text-gray-400 hover:text-white select-none">Ver mensaje</summary>
                {messages.map((message, i) => (
                  <div key={i} className="mt-3">
                    <pre className="whitespace-pre-wrap break-words font-sans text-xs text-gray-200 bg-dark rounded-lg p-3 border border-gray-800 max-h-48 overflow-y-auto">
                      {message}
                    </pre>
                    <button onClick={() => void copyMessage(message)} className="mt-1 text-accent text-xs font-semibold hover:text-white">
                      Copiar{messages.length > 1 ? ` parte ${i + 1}` : ''}
                    </button>
                  </div>
                ))}
              </details>

              {sent && (
                <div className="flex items-center justify-between rounded-xl bg-dark/60 border border-gray-800 px-4 py-3 text-sm">
                  <span className="text-gray-300">¿Ya enviaste el pedido?</span>
                  <button onClick={clearCart} className="font-bold text-accent hover:text-white">
                    Vaciar carrito
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {editing && (
        <ProductOptionsModal
          product={editing.product}
          initial={editing.item}
          submitLabel="Guardar cambios"
          onClose={stopEditing}
          onSubmit={(options) => {
            cart.update(editing.item.key, options);
            stopEditing();
          }}
        />
      )}
    </>
  );
};
