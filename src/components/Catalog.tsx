import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from './ProductCard';
import { FilterBar } from './FilterBar';
import productsData from '../data/products.json';

interface CatalogProps {
  storeMode: 'equipos' | 'selecciones' | 'f1';
  resetFiltersKey: number;
}

export const Catalog: React.FC<CatalogProps> = ({ storeMode, resetFiltersKey }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  // Filter by storeMode first
  const baseProducts = useMemo(() => {
    const all = productsData as Product[];
    return all.filter(p => {
      const isSeleccion = p.images[0]?.src.includes('/selecciones/');
      const isF1 = p.images[0]?.src.includes('/f1/');
      
      if (storeMode === 'selecciones') return isSeleccion;
      if (storeMode === 'f1') return isF1;
      return !isSeleccion && !isF1; // equipos
    });
  }, [storeMode]);

  // Reset filters on mode change or logo click
  useEffect(() => {
    setSelectedTeam(null);
    setSelectedVersion(null);
  }, [storeMode, resetFiltersKey]);

  // Get unique teams and versions for filters
  const teams = useMemo(() => {
    const unique = new Set(baseProducts.map(p => p.team).filter(t => t !== ''));
    return Array.from(unique);
  }, [baseProducts]);

  const versions = useMemo(() => {
    const unique = new Set(baseProducts.map(p => p.version).filter(v => v !== ''));
    return Array.from(unique);
  }, [baseProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return baseProducts.filter(p => {
      const matchTeam = selectedTeam ? p.team === selectedTeam : true;
      const matchVersion = selectedVersion ? p.version === selectedVersion : true;
      return matchTeam && matchVersion;
    });
  }, [baseProducts, selectedTeam, selectedVersion]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight italic">
          <span className="text-accent">F1</span>Futbol - Catálogo
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Camisetas calidad 1:1 - Para más información contactarse por Instagram
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
