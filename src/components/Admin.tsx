import React, { useState } from 'react';

export const Admin = () => {
  const [storeMode, setStoreMode] = useState('equipos');
  const [title, setTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [team, setTeam] = useState('');
  const [version, setVersion] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  
  // Extras
  const [hasPersonalizacion, setHasPersonalizacion] = useState(false);
  const [hasParches, setHasParches] = useState(false);
  const [hasMangaLarga, setHasMangaLarga] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const teamSuggestions: Record<string, string[]> = {
    'equipos': ['river', 'boca', 'san lorenzo', 'racing', 'independiente'],
    'selecciones': ['argentina', 'brasil', 'españa', 'francia', 'alemania'],
    'f1': ['ferrari', 'mercedes', 'redbull', 'mclaren', 'astonmartin', 'alpine', 'audi', 'williams']
  };
  const currentTeamSuggestions = teamSuggestions[storeMode] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images || images.length === 0) {
      setStatus({ type: 'error', message: 'Debes seleccionar al menos una imagen.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // 1. Subir imágenes
      const formData = new FormData();
      formData.append('storeMode', storeMode);
      formData.append('team', team);
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }

      const uploadRes = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Error al subir las imágenes');
      const uploadData = await uploadRes.json();
      const filePaths = uploadData.filePaths;

      // 2. Construir producto
      const details: {label: string; value: string}[] = [];
      if (hasPersonalizacion) details.push({ label: 'Personalización', value: '+$5.000' });
      if (hasParches) details.push({ label: 'Parches', value: '+$2.500 c/u' });
      if (hasMangaLarga) details.push({ label: 'Manga Larga', value: '+$5.000' });

      const newProduct = {
        title,
        basePrice: parseInt(basePrice),
        team: team.toLowerCase(),
        version: version.toLowerCase(),
        details,
        images: filePaths.map((path: string) => ({
          src: path,
          alt: ""
        }))
      };

      // 3. Guardar producto en JSON
      const productRes = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (!productRes.ok) throw new Error('Error al guardar el producto en el JSON');

      setStatus({ type: 'success', message: '¡Producto creado exitosamente!' });
      
      // Limpiar formulario
      setTitle('');
      setBasePrice('');
      setImages(null);
      // Opcional: no limpiar el team/version para cargar varios similares rápido

    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-card rounded-2xl border border-gray-800 p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2">Panel de Control</h1>
        <p className="text-gray-400 mb-8">Agrega nuevos productos al catálogo sin tocar código.</p>
        
        {status.message && (
          <div className={`p-4 rounded-xl mb-6 font-bold ${status.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Categoría Global */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Categoría Global</label>
              <select 
                value={storeMode} 
                onChange={(e) => setStoreMode(e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none"
              >
                <option value="equipos">Equipos / Clubes</option>
                <option value="selecciones">Selecciones</option>
                <option value="f1">Fórmula 1</option>
              </select>
            </div>

            {/* Equipo */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Equipo / Marca</label>
              <input 
                type="text" 
                list="team-suggestions"
                value={team} 
                onChange={(e) => setTeam(e.target.value)} 
                placeholder="Ej: river, boca, argentina, ferrari"
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none placeholder-gray-600"
                required
              />
              <datalist id="team-suggestions">
                {currentTeamSuggestions.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Título del Producto</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ej: River Titular 24/25"
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none placeholder-gray-600"
                required
              />
            </div>

            {/* Precio Base */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Precio Base ($)</label>
              <input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                list="price-suggestions"
                value={basePrice} 
                onChange={(e) => setBasePrice(e.target.value)} 
                placeholder="Ej: 50000"
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none placeholder-gray-600"
                required
              />
              <datalist id="price-suggestions">
                <option value="55000" />
                <option value="60000" />
                <option value="65000" />
                <option value="75000" />
                <option value="100000" />
                <option value="120000" />
              </datalist>
            </div>

            {/* Versión / Tipo */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Versión / Tipo</label>
              <select 
                value={version} 
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="hincha">Hincha</option>
                <option value="jugador">Jugador</option>
                <option value="retro">Retro</option>
                <option value="abrigo">Abrigo</option>
                <option value="especial">Especial</option>
                <option value="chomba">Chomba (F1)</option>
                <option value="camiseta">Camiseta (F1)</option>
              </select>
            </div>
          </div>

          {/* Adicionales */}
          <div className="bg-dark/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-bold mb-4">Opciones Adicionales</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasPersonalizacion} onChange={(e) => setHasPersonalizacion(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-accent focus:ring-accent bg-dark" />
                <span className="text-gray-300">Personalización (+$5.000)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasParches} onChange={(e) => setHasParches(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-accent focus:ring-accent bg-dark" />
                <span className="text-gray-300">Parches (+$2.500 c/u)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasMangaLarga} onChange={(e) => setHasMangaLarga(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-accent focus:ring-accent bg-dark" />
                <span className="text-gray-300">Manga Larga (+$5.000)</span>
              </label>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Imágenes (Múltiples)</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-dark/50 hover:bg-dark hover:border-accent transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => setImages(e.target.files)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent file:text-white hover:file:bg-accent/80 cursor-pointer"
                required
              />
              <p className="text-xs text-gray-500 mt-4">Seleccioná todas las imágenes del producto juntas. La primera será la principal.</p>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-black text-lg transition-all ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-accent hover:brightness-110 shadow-lg shadow-accent/30 hover:scale-[1.02]'}`}
          >
            {loading ? 'Subiendo producto...' : 'Guardar Nuevo Producto'}
          </button>
        </form>
      </div>
    </div>
  );
};
