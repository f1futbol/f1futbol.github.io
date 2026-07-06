

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
  const formatTeamName = (team: string) => {
    if (team === 'sanlorenzo') return 'San Lorenzo';
    if (team === 'f1') return 'F1';
    return team;
  };

  return (
    <div className="bg-card p-4 rounded-xl shadow-md border border-gray-800 mb-8 sticky top-4 z-40">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Teams Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => onSelectTeam(null)}
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
              onClick={() => onSelectTeam(team)}
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

        {/* Divider for mobile */}
        <div className="w-full h-px bg-gray-800 md:hidden"></div>

        {/* Versions Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => onSelectVersion(null)}
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
              onClick={() => onSelectVersion(version)}
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
  );
};
