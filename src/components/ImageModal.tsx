import { useState, useEffect } from 'react';
import { useScrollLock } from '../lib/useScrollLock';
import { fullUrl } from '../lib/images';
import { InstagramIcon } from './InstagramIcon';
import { INSTAGRAM_DM_URL } from '../lib/order';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { src: string; alt: string }[];
  initialIndex: number;
  /** Si se pasa, el botón abre el formulario de pedido; si no, lleva al DM de Instagram. */
  onOrder?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images, initialIndex, onOrder }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update index if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-6 text-4xl text-white hover:text-gray-300 transition-colors z-[110]"
        onClick={onClose}
      >
        &times;
      </button>

      {images.length > 1 && (
        <button 
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 -mt-10 md:-mt-12 text-5xl md:text-6xl text-white hover:text-gray-300 transition-colors px-2 py-8 z-[110]"
          onClick={handlePrev}
        >
          &#10094;
        </button>
      )}

      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col items-center justify-center p-4 pb-20 gap-4">
        <img 
          src={fullUrl(images[currentIndex].src)}
          alt="" 
          className="max-w-full max-h-[calc(100%-3rem)] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} 
        />
        <div className="text-gray-300 text-sm md:text-base font-medium tracking-wide">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <button 
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 -mt-10 md:-mt-12 text-5xl md:text-6xl text-white hover:text-gray-300 transition-colors px-2 py-8 z-[110]"
          onClick={handleNext}
        >
          &#10095;
        </button>
      )}

      {/* CTA: formulario de pedido (productos) o DM directo (tablas de talles) */}
      {onOrder ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOrder(); }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(220,39,67,0.4)] hover:scale-105 transition-all duration-300 z-[120] font-black tracking-wider flex items-center gap-2 whitespace-nowrap"
        >
          <InstagramIcon />
          ¡ENCARGAR!
        </button>
      ) : (
        <a
          href={INSTAGRAM_DM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(220,39,67,0.4)] hover:scale-105 transition-all duration-300 z-[120] font-black tracking-wider flex items-center gap-2 whitespace-nowrap"
        >
          <InstagramIcon />
          CONSULTAR
        </a>
      )}
    </div>
  );
};
