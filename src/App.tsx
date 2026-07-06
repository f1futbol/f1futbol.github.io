
import { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { TallesView } from './components/TallesView';

function App() {
  const [view, setView] = useState<'catalog' | 'talles'>('catalog');
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  return (
    <div className="min-h-screen bg-dark">
      {/* Header/Nav */}
      <nav className="bg-black/70 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setView('catalog');
                scrollToTop();
              }}
            >
              <img src="/catalogo/logo1.webp" alt="F1Futbol Store" className="h-10 w-10 rounded-full group-hover:scale-105 transition-transform" />
              <span className="text-white font-black italic text-xl tracking-tight">
                <span className="text-accent">F1</span>Futbol
              </span>
            </div>
            <button 
              onClick={() => setView(view === 'catalog' ? 'talles' : 'catalog')}
              className="text-white font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-accent hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              {view === 'catalog' ? 'Tablas de Talles' : 'Volver al Catálogo'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {view === 'catalog' ? <Catalog /> : <TallesView />}
      </main>

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
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      </a>

      {/* Scroll to Top Button (Mobile Only) */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 left-6 bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 z-50 md:hidden hover:bg-gray-700 transition-all duration-300 flex items-center justify-center ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
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
