import { useState, useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { src: string; alt: string }[];
  initialIndex: number;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update index if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
          className="absolute left-4 top-1/2 -translate-y-1/2 text-5xl text-white hover:text-gray-300 transition-colors px-4 py-8"
          onClick={handlePrev}
        >
          &#10094;
        </button>
      )}

      <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center p-4">
        <img 
          src={`${import.meta.env.BASE_URL}${images[currentIndex].src}`} 
          alt={images[currentIndex].alt} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} 
        />
        <div className="absolute bottom-[-40px] text-gray-400 text-sm">
          {currentIndex + 1} / {images.length} - {images[currentIndex].alt}
        </div>
      </div>

      {images.length > 1 && (
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl text-white hover:text-gray-300 transition-colors px-4 py-8"
          onClick={handleNext}
        >
          &#10095;
        </button>
      )}
    </div>
  );
};
