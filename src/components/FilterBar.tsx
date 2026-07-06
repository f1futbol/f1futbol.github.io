import { useState, useEffect } from 'react';

interface FilterBarProps {
  teams: string[];
  versions: string[];
  selectedTeam: string | null;
  selectedVersion: string | null;
  onSelectTeam: (team: string | null) => void;
  onSelectVersion: (version: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  teams, versions, selectedTeam, selectedVersion, onSelectTeam, onSelectVersion 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTeamName = (team: string) => {
    if (team === 'sanlorenzo') return 'San Lorenzo';
    if (team === 'f1') return 'F1';
    return team;
  };

  const activeCount = (selectedTeam ? 1 : 0) + (selectedVersion ? 1 : 0);

  // Lock body scroll when filter sheet is open
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

  const handleApplyMobileFilters = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTeam = (team: string | null) => {
    onSelectTeam(team);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVersion = (version: string | null) => {
    onSelectVersion(version);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ============================================================== */}
      {/* VISTA MÓVIL (FAB + Bottom Sheet) - Solo visible en pantallas chicas */}
      {/* ============================================================== */}
      <div className="md:hidden">
        {/* Floating Action Button (Dock) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-black/80 backdrop-blur-md border border-gray-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] px-6 py-3 rounded-full flex items-center gap-3 text-white hover:bg-black transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold whitespace-nowrap">
              Filtros {activeCount > 0 && <span className="text-accent ml-1">({activeCount})</span>}
            </span>
          </button>
        </div>

        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Bottom Sheet */}
        <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-x border-gray-800 rounded-t-3xl p-6 pb-12 z-[80] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Filtrar Catálogo</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 pb-4">
            {/* Teams Filter Mobile */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Equipos</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectTeam(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedTeam === null 
                      ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                      : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Todos los Equipos
                </button>
                {teams.map(team => (
                  <button
                    key={team}
                    onClick={() => onSelectTeam(team)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      selectedTeam === team 
                        ? 'bg-white text-dark shadow-lg' 
                        : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {formatTeamName(team)}
                  </button>
                ))}
              </div>
            </div>

            {/* Versions Filter Mobile */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Versiones</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectVersion(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedVersion === null 
                      ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                      : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Todas las Versiones
                </button>
                {versions.map(version => (
                  <button
                    key={version}
                    onClick={() => onSelectVersion(version)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      selectedVersion === version 
                        ? 'bg-white text-dark shadow-lg' 
                        : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {version}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleApplyMobileFilters} 
            className="w-full bg-accent text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-accent/30 mt-4 text-lg"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>


      {/* ============================================================== */}
      {/* VISTA ESCRITORIO (Grilla Original) - Solo visible en pantallas grandes */}
      {/* ============================================================== */}
      <div className="hidden md:block bg-card p-4 rounded-xl shadow-md border border-gray-800 mb-8 sticky top-20 z-40">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Teams Filter Desktop */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleSelectTeam(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTeam === null 
                  ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                  : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Todos los Equipos
            </button>
            {teams.map(team => (
              <button
                key={team}
                onClick={() => handleSelectTeam(team)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  selectedTeam === team 
                    ? 'bg-white text-dark shadow-lg' 
                    : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {formatTeamName(team)}
              </button>
            ))}
          </div>

          {/* Versions Filter Desktop */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleSelectVersion(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedVersion === null 
                  ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                  : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Todas las Versiones
            </button>
            {versions.map(version => (
              <button
                key={version}
                onClick={() => handleSelectVersion(version)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  selectedVersion === version 
                    ? 'bg-white text-dark shadow-lg' 
                    : 'bg-dark text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {version}
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};
