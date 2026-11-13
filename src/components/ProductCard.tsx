import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageModal } from './ImageModal';
import { ProductOptionsModal } from './ProductOptionsModal';
import { InstagramIcon } from './InstagramIcon';
import { formatPrice } from '../lib/order';
import { cart } from '../lib/cart';
import { thumbUrl, fallbackToFull } from '../lib/images';

export interface Product {
  id: string;
  team: string;
  version: string;
  title: string;
  basePrice: number;
  images: { src: string; alt: string }[];
  details: { label: string; value: string }[];
  year?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const closeOrder = useCallback(() => setIsOrderOpen(false), []);
  // Desde la galería: se cierra la galería y se abre el formulario (nunca los dos a la vez)
  const openOrder = useCallback(() => { setIsModalOpen(false); setIsOrderOpen(true); }, []);
  const [isVisible, setIsVisible] = useState(false);
  // La foto del dorso solo se descarga cuando el mouse pasa por la tarjeta,
  // y el cruce de imágenes solo se activa cuando ya cargó (evita un flash negro).
  const [wantBack, setWantBack] = useState(false);
  const [backLoaded, setBackLoaded] = useState(false);
  const front = product.images[0];
  const back = product.images[1];
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div 
        ref={cardRef}
        className={`bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(204,0,0,0.15)] transition-all duration-700 ease-out flex flex-col h-full border border-gray-800 hover:border-accent/30 group/card ${isVisible ? 'opacity-100 translate-y-0 hover:-translate-y-2' : 'opacity-0 translate-y-16'}`}
      >
        <div 
          className="relative w-full overflow-hidden cursor-pointer group bg-black flex-none"
          onClick={() => setIsModalOpen(true)}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse' && back) setWantBack(true); }}
        >
          {/* Main Front Image */}
          {front && (
            <img
              src={thumbUrl(front.src)}
              onError={fallbackToFull(front.src)}
              alt={product.title}
              width={600}
              height={600}
              loading="lazy"
              decoding="async"
              className={`w-full aspect-square object-cover transition-all duration-700 ease-in-out ${
                backLoaded ? 'md:group-hover:opacity-0 md:group-hover:scale-110' : 'md:group-hover:scale-105'
              }`}
            />
          )}

          {/* Back Image (Hover Reveal - Desktop Only, se carga recién en el primer hover) */}
          {back && wantBack && (
            <img
              src={thumbUrl(back.src)}
              onError={fallbackToFull(back.src)}
              onLoad={() => setBackLoaded(true)}
              alt={`${product.title} dorso`}
              width={600}
              height={600}
              decoding="async"
              className={`absolute inset-0 w-full aspect-square object-cover opacity-0 transition-all duration-700 ease-in-out ${
                backLoaded ? 'md:group-hover:opacity-100 md:group-hover:scale-105' : ''
              }`}
            />
          )}
          
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all duration-500 flex items-end justify-center pb-6">
            <span className="opacity-0 group-hover:opacity-100 bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 translate-y-4 group-hover:translate-y-0 border border-gray-700">
              Ver Galería ({product.images.length})
            </span>
          </div>
        </div>

        <div className="p-3 md:p-5 flex flex-col flex-grow">
          <div className="mb-1 md:mb-2 flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400">
              {product.version.toLowerCase() === 'abrigo' ? 'Abrigo' : `Versión ${product.version}`}
            </span>
          </div>
          
          <h3 className="text-sm md:text-lg font-bold text-white mb-2 md:mb-3 leading-tight min-h-[2.5rem] md:min-h-[3.5rem] line-clamp-2">
            {product.title}
          </h3>
          
          <div className="pt-2 md:pt-4 border-t border-gray-800 flex flex-col flex-grow">
            <div className="text-lg md:text-3xl font-black text-accent mb-2 md:mb-3 tracking-tight drop-shadow-md">
              {formatPrice(product.basePrice)}
            </div>
            
            {(product.details || []).length > 0 && (
              <div className="mb-2 md:mb-4 space-y-1 block">
                <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 md:mb-2">Adicionales disponibles:</p>
                {(product.details || []).map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] md:text-sm">
                    <span className="text-gray-400">{detail.label}</span>
                    <span className="font-medium text-gray-200">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={openOrder}
              className="mt-auto w-full bg-accent hover:brightness-110 text-white rounded-lg py-2 md:py-2.5 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all shadow-md shadow-accent/20"
            >
              <InstagramIcon className="w-4 h-4 md:w-5 md:h-5" />
              Encargar
            </button>
          </div>
        </div>
      </div>

      <ImageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={product.images}
        initialIndex={0}
        onOrder={openOrder}
      />

      {isOrderOpen && (
        <ProductOptionsModal
          product={product}
          submitLabel="Agregar al pedido"
          onClose={closeOrder}
          onSubmit={(options) => {
            cart.add(product.id, options); // agrega y abre el carrito
            closeOrder();
          }}
        />
      )}
    </>
  );
};
