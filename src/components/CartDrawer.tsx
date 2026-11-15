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

const PencilIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const CartDrawer = () => {
  const { items, isOpen, sent } = useCart();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Mensajes ya copiados (por texto: si el pedido cambia, se "desmarcan" solos)
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  // "Vaciar" del encabezado pide confirmación para no borrar todo por un toque sin querer
  const [confirmClear, setConfirmClear] = useState(false);

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

  const close = useCallback(() => {
    setConfirmClear(false);
    cart.close();
  }, []);
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
    close();
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
        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-800 min-h-[76px]">
          {confirmClear && lines.length > 0 ? (
            <>
              <p className="text-base font-bold text-white whitespace-nowrap">¿Vaciar todo?</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-2.5 py-2 transition-colors"
                >
                  <TrashIcon />
                  Sí, vaciar
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="whitespace-nowrap rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm font-semibold px-2.5 py-2 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-white italic">
                Tu pedido {units > 0 && <span className="text-accent">({units})</span>}
              </h2>
              <div className="flex items-center gap-1">
                {lines.length > 0 && (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 text-sm font-semibold px-2.5 py-2 transition-colors"
                  >
                    <TrashIcon />
                    Vaciar
                  </button>
                )}
                <button onClick={close} aria-label="Cerrar carrito" className="text-gray-400 hover:text-white text-3xl leading-none px-1">
                  &times;
                </button>
              </div>
            </>
          )}
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

                      <div className="flex gap-2 mt-2 -ml-2 text-sm font-semibold">
                        <button
                          onClick={() => setEditingKey(item.key)}
                          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <PencilIcon />
                          Editar
                        </button>
                        <button
                          onClick={() => cart.remove(item.key)}
                          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <TrashIcon />
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

              {/* Instrucciones de envío: arriba del botón y bien visibles, para leerlas antes de tocar */}
              <div aria-live="polite">
                {messages.some((m) => copied[m] === false) ? (
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm md:text-base text-red-300 font-semibold">
                    No se pudo copiar automáticamente. Abrí “Ver mensaje” más abajo y copialo a mano.
                  </div>
                ) : anyCopied ? (
                  <div className="rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm md:text-base text-green-300">
                    <p className="font-black text-base md:text-lg">✓ ¡Pedido copiado!</p>
                    <p className="mt-1">
                      Ahora pegalo en el chat con <span className="font-bold text-white">@{INSTAGRAM_USER}</span> y envialo.
                      {messages.length > 1 && ' Después volvé y enviá la parte que sigue.'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm md:text-base text-gray-100">
                    <p className="font-black text-white mb-1.5">📋 Cómo enviar tu pedido</p>
                    <ol className="space-y-1 list-decimal list-inside marker:font-bold marker:text-accent">
                      <li>
                        Tocá el botón: <span className="font-semibold text-white">tu pedido se copia</span> y se abre
                        Instagram.
                      </li>
                      <li>
                        En el chat con <span className="font-semibold text-white">@{INSTAGRAM_USER}</span>,{' '}
                        <span className="font-semibold text-white">pegalo y envialo</span>.
                      </li>
                    </ol>
                    {messages.length > 1 && (
                      <p className="mt-2 text-gray-300">
                        Tu pedido es largo y Instagram corta los mensajes: se envía en{' '}
                        <span className="font-semibold text-white">{messages.length} partes</span>, una por botón, en orden.
                      </p>
                    )}
                  </div>
                )}
              </div>

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
