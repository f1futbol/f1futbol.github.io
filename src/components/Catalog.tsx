import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from './ProductCard';
import { FilterBar } from './FilterBar';
import type { SortOption } from './FilterBar';
import productsData from '../data/products.json';

interface CatalogProps {
  storeMode: 'equipos' | 'selecciones' | 'f1';
}

export const Catalog: React.FC<CatalogProps> = ({ storeMode }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');

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

  // Reset filters on mode change
  useEffect(() => {
    setSelectedTeam(null);
    setSelectedVersion(null);
  }, [storeMode]);

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

  // Sort products
  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];
    if (selectedSort === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (selectedSort === 'year_desc') {
      const getYear = (p: Product) => {
        if (p.year) return p.year;
        
        const match = p.title.match(/\b(19\d{2}|20\d{2}|\d{2}\/\d{2}|\d{2})\b/);
        if (match) {
           const str = match[0];
           let firstPart = str;
           if (str.includes('/')) {
             firstPart = str.split('/')[0];
           }
           if (firstPart.length === 2) {
             return parseInt(firstPart) > 50 ? 1900 + parseInt(firstPart) : 2000 + parseInt(firstPart);
           }
           return parseInt(firstPart);
        }
        return 0; // fallback if no year
      };
      result.sort((a, b) => getYear(b) - getYear(a));
    }
    
    // Priority sorting for F1
    if (selectedSort === 'recent' && storeMode === 'f1') {
      const mercedes = result.filter(p => p.team === 'mercedes');
      const others = result.filter(p => p.team !== 'mercedes');
      return [...mercedes, ...others];
    }
    
    return result;
  }, [filteredProducts, selectedSort, storeMode]);

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
        selectedSort={selectedSort}
        onSelectTeam={setSelectedTeam}
        onSelectVersion={setSelectedVersion}
        onSelectSort={setSelectedSort}
      />

      {sortedProducts.length === 0 ? (
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
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
