import { useState } from 'react';
import { ImageModal } from './ImageModal';

export interface Product {
  id: string;
  team: string;
  version: string;
  title: string;
  basePrice: number;
  images: { src: string; alt: string }[];
  details: { label: string; value: string }[];
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-800 hover:border-gray-700">
        <div 
          className="relative w-full overflow-hidden cursor-pointer group bg-black flex-none"
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={`/${product.images[0]?.src}`} 
            alt={product.title} 
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              console.error("Image failed to load:", `/${product.images[0]?.src}`);
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/111111/cccccc?text=F1Futbol';
            }}
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              Ver Galería ({product.images.length})
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Versión {product.version}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-3 leading-tight min-h-[3.5rem] line-clamp-2">
            {product.title}
          </h3>
          
          <div className="pt-4 border-t border-gray-800 flex flex-col flex-grow">
            <div className="text-2xl font-black text-accent mb-3">
              {formatPrice(product.basePrice)}
            </div>
            
            {product.details.length > 0 && (
              <div className="mb-4 space-y-1">
                <p className="text-xs text-gray-400 font-medium mb-2">Adicionales disponibles:</p>
                {product.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
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
