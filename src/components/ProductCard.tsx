import { useState, useEffect, useRef } from 'react';
import { ImageModal } from './ImageModal';

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
  const [isVisible, setIsVisible] = useState(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div 
        ref={cardRef}
        className={`bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(204,0,0,0.15)] transition-all duration-700 ease-out flex flex-col h-full border border-gray-800 hover:border-accent/30 group/card ${isVisible ? 'opacity-100 translate-y-0 hover:-translate-y-2' : 'opacity-0 translate-y-16'}`}
      >
        <div 
          className="relative w-full overflow-hidden cursor-pointer group bg-black flex-none"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Main Front Image */}
          <img 
            src={`${import.meta.env.BASE_URL}${product.images[0]?.src}`} 
            alt={product.title} 
            className={`w-full aspect-square object-cover transition-all duration-700 ease-in-out ${
              product.images.length > 1 ? 'md:group-hover:opacity-0 md:group-hover:scale-110' : 'md:group-hover:scale-105'
            }`}
          />
          
          {/* Back Image (Hover Reveal - Desktop Only) */}
          {product.images.length > 1 && (
            <img 
              src={`${import.meta.env.BASE_URL}${product.images[1]?.src}`} 
              alt={`${product.title} dorso`} 
              className="absolute inset-0 w-full aspect-square object-cover opacity-0 transition-all duration-700 ease-in-out md:group-hover:opacity-100 md:group-hover:scale-105"
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
              Versión {product.version}
            </span>
          </div>
          
          <h3 className="text-sm md:text-lg font-bold text-white mb-2 md:mb-3 leading-tight min-h-[2.5rem] md:min-h-[3.5rem] line-clamp-2">
            {product.title}
          </h3>
          
          <div className="pt-2 md:pt-4 border-t border-gray-800 flex flex-col flex-grow">
            <div className="text-lg md:text-3xl font-black text-accent mb-2 md:mb-3 tracking-tight drop-shadow-md">
              {formatPrice(product.basePrice)}
            </div>
            
            {product.details.length > 0 && (
              <div className="mb-2 md:mb-4 space-y-1 block">
                <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 md:mb-2">Adicionales disponibles:</p>
                {product.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] md:text-sm">
                    <span className="text-gray-400">{detail.label}</span>
                    <span className="font-medium text-gray-200">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>

      <ImageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={product.images}
        initialIndex={0}
      />
    </>
  );
};
