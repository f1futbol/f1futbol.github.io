import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from './ProductCard';
import { FilterBar } from './FilterBar';
import productsData from '../data/products.json';

export const Catalog: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const products = productsData as Product[];

  // Get unique teams and versions for filters
  const teams = useMemo(() => {
    const unique = new Set(products.map(p => p.team).filter(t => t !== ''));
    return Array.from(unique);
  }, [products]);

  const versions = useMemo(() => {
    const unique = new Set(products.map(p => p.version).filter(v => v !== ''));
    return Array.from(unique);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchTeam = selectedTeam ? p.team === selectedTeam : true;
      const matchVersion = selectedVersion ? p.version === selectedVersion : true;
      return matchTeam && matchVersion;
    });
  }, [products, selectedTeam, selectedVersion]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight italic">
          <span className="text-accent">F1</span>Futbol Catálogo
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Descubrí la mejor calidad en indumentaria deportiva. Versiones hincha, jugador y ediciones retro exclusivas.
        </p>
      </div>

      <FilterBar 
        teams={teams}
        versions={versions}
        selectedTeam={selectedTeam}
        selectedVersion={selectedVersion}
        onSelectTeam={setSelectedTeam}
        onSelectVersion={setSelectedVersion}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-gray-800">
          <p className="text-gray-400 text-lg">No hay productos que coincidan con estos filtros.</p>
          <button 
            onClick={() => { setSelectedTeam(null); setSelectedVersion(null); }}
            className="mt-4 text-accent hover:text-white transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
