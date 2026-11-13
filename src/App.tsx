
import { useState, useEffect, lazy, Suspense } from 'react';
import { Catalog } from './components/Catalog';
import { TallesView } from './components/TallesView';
import { InstagramIcon } from './components/InstagramIcon';
import { CartDrawer } from './components/CartDrawer';
import { cart, useCart } from './lib/cart';

// El panel admin solo existe en desarrollo (`npm run admin`): en el build de
// producción esta rama se elimina y el componente no se incluye en el bundle.
const Admin = import.meta.env.DEV
  ? lazy(() => import('./components/Admin').then((m) => ({ default: m.Admin })))
  : null;

function App() {
  const [view, setView] = useState<'catalog' | 'talles'>('catalog');
  const [storeMode, setStoreMode] = useState<'equipos' | 'selecciones' | 'f1'>(() => {
    const saved = localStorage.getItem('storeMode');
    if (saved === 'equipos' || saved === 'selecciones' || saved === 'f1') return saved;
    return 'equipos';
  });
  const [resetFiltersKey, setResetFiltersKey] = useState(0);
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    localStorage.setItem('storeMode', storeMode);
  }, [storeMode]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Reset all themes
    document.body.classList.remove('theme-selecciones', 'theme-f1');
    // Apply the active theme
    if (storeMode === 'selecciones') {
      document.body.classList.add('theme-selecciones');
    } else if (storeMode === 'f1') {
      document.body.classList.add('theme-f1');
    }
  }, [storeMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (Admin && window.location.pathname === '/admin') {
    return (
      <div className="min-h-screen bg-dark">
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header/Nav */}
      <nav className="bg-black/70 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-1 sm:gap-4">

            {/* Left: Logo */}
            <div className="flex-none md:w-1/3 flex justify-start">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => {
                  setView('catalog');
                  setResetFiltersKey(prev => prev + 1);
                  scrollToTop();
                }}
              >
                <img src={storeMode === 'selecciones' ? '/catalogo/logo2.webp' : storeMode === 'f1' ? '/catalogo/logo3.webp' : '/catalogo/logo1.webp'} alt="F1Futbol Store" className="h-10 w-10 rounded-full group-hover:scale-105 transition-transform" />
                <span className="text-white font-black italic text-xl tracking-tight hidden lg:block">
                  <span className="text-accent">F1</span>Futbol
                </span>
              </div>
            </div>

            {/* Center: Switch */}
            <div className="flex-1 md:w-1/3 flex justify-center mx-1 sm:mx-0">
              <div className="flex w-full max-w-[280px] sm:max-w-[340px] bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-inner">
                <button
                  onClick={() => setStoreMode('equipos')}
                  className={`flex-1 py-1.5 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 flex items-center justify-center ${storeMode === 'equipos' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Equipos
                </button>
                <button
                  onClick={() => setStoreMode('selecciones')}
                  className={`flex-1 py-1.5 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 flex items-center justify-center ${storeMode === 'selecciones' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Selección
                </button>
                <button
                  onClick={() => setStoreMode('f1')}
                  className={`flex-1 py-1.5 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 flex items-center justify-center ${storeMode === 'f1' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  F1
                </button>
              </div>
            </div>

            {/* Right: Talles + Carrito */}
            <div className="flex-none md:w-1/3 flex justify-end items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setView(view === 'catalog' ? 'talles' : 'catalog')}
                className="text-white font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-accent hover:brightness-110 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-base whitespace-nowrap"
              >
                {view === 'catalog' ? 'Talles' : 'Catálogo'}
              </button>
              <button
                onClick={() => cart.open()}
                aria-label={`Ver pedido (${cartCount} ${cartCount === 1 ? 'producto' : 'productos'})`}
                className="relative p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-black flex items-center justify-center border-2 border-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {view === 'catalog' ? <Catalog storeMode={storeMode} resetFiltersKey={resetFiltersKey} /> : <TallesView />}
      </main>

      <CartDrawer />

      {/* Footer */}
      <footer className="bg-black py-8 mt-12 border-t border-gray-800">
        <div className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} F1Futbol Store. Todos los derechos reservados.
        </div>
      </footer>

      {/* Instagram Floating Button */}
      <a
        href="https://instagram.com/f1futbol.store"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,39,67,0.4)] hover:scale-110 hover:shadow-[0_0_25px_rgba(220,39,67,0.6)] transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Instagram"
      >
        <InstagramIcon className="w-8 h-8" />
      </a>

      {/* Scroll to Top Button (Mobile Only) */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 left-6 bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 z-50 md:hidden hover:bg-gray-700 transition-all duration-300 flex items-center justify-center ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Volver arriba"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}

export default App;

