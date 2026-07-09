import { useState } from 'react';
import { ImageModal } from './ImageModal';

export const TallesView = () => {
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);

  const tallesImages = [
    { src: 'catalogo/medidas/hincha y retro.webp', alt: 'Medidas Versión Hincha y Retro' },
    { src: 'catalogo/medidas/medidas player.webp', alt: 'Medidas Versión Jugador' },
    { src: 'catalogo/medidas/f1.webp', alt: 'Medidas F1' },
    { src: 'catalogo/medidas/camperas_rompevientos.webp', alt: 'Medidas Camperas Rompevientos' },
    { src: 'catalogo/medidas/camperas_acetato.webp', alt: 'Medidas Camperas Acetato' },
    { src: 'catalogo/medidas/version mujer.webp', alt: 'Medidas Versión Mujer' },
    { src: 'catalogo/medidas/niño.webp', alt: 'Medidas Kit de Niño' },
    { src: 'catalogo/medidas/shorts.webp', alt: 'Medidas Shorts' },
    { src: 'catalogo/medidas/como medir camisetas.webp', alt: 'Cómo medir camisetas' },
    { src: 'catalogo/medidas/como medir shorts.webp', alt: 'Cómo medir shorts' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-8 tracking-tight italic">Tablas de Talles</h2>
      <div className="flex flex-col gap-8 items-center">
        {tallesImages.map((img, idx) => (
          <div 
            key={idx} 
            className="bg-card rounded-xl overflow-hidden shadow-lg border border-gray-800 p-4 w-full flex justify-center cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => setSelectedImageIdx(idx)}
          >
            <img src={`/${img.src}`} alt={img.alt} className="max-w-full h-auto rounded" />
          </div>
        ))}
      </div>

      {selectedImageIdx !== null && (
        <ImageModal
          isOpen={true}
          images={tallesImages}
          initialIndex={selectedImageIdx}
          onClose={() => setSelectedImageIdx(null)}
        />
      )}
    </div>
  );
};
