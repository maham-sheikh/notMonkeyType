import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  UserPlus, 
  X, 
  Info
} from 'lucide-react';

// Advanced Rivals Management Component
const RivalsManagement = ({ 
  rivals, 
  onRivalSelect, 
  currentActiveRivalId,
  friendService 
}) => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, recent, top
  const [rivalDetailsModal, setRivalDetailsModal] = useState(null);
  const [suggestedRivals, setSuggestedRivals] = useState([]);

  // Filtering and Search Logic
  const filteredRivals = useMemo(() => {
    let processedRivals = rivals;

    // Search Filter
    if (searchTerm) {
      processedRivals = processedRivals.filter(rival => 
        rival.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Mode-based Filtering
    switch (filterMode) {
      case 'recent':
        processedRivals = processedRivals
          .sort((a, b) => new Date(b.lastMatchDate) - new Date(a.lastMatchDate))
          .slice(0, 5);
        break;
      case 'top':
        processedRivals = processedRivals
          .sort((a, b) => b.winPercentage - a.winPercentage)
          .slice(0, 5);
        break;
      default:
        break;
    }

    return processedRivals;
  }, [rivals, searchTerm, filterMode]);

  // Fetch Suggested Rivals
  useEffect(() => {
    const fetchSuggestedRivals = async () => {
      try {
        const suggested = await friendService.getSuggestedRivals();
        setSuggestedRivals(suggested);
      } catch (error) {
        console.error('Failed to fetch suggested rivals', error);
      }
    };

    fetchSuggestedRivals();
  }, []);

  // Rival Details Modal Component
  const RivalDetailsModal = ({ rival, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="
        bg-black/80 
        rounded-2xl 
        max-w-md 
        w-full 
        p-6 
        border 
        border-accent/30
        animate-fade-in-up
      ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Rival Details</h2>
          <button 
            onClick={onClose}
            className="
              text-white/60 
              hover:text-accent 
              transition-colors
            "
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img 
              src={rival.avatar} 
              alt={rival.name} 
              className="w-16 h-16 rounded-full border-2 border-accent"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{rival.name}</h3>
              <p className="text-white/60">Rank: {rival.rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="
              bg-black/40 
              rounded-lg 
              p-3 
              text-center
              hover:bg-black/50
              transition-colors
            ">
              <p className="text-xs text-white/60">Win Rate</p>
              <p className="text-lg font-bold text-accent">
                {rival.winPercentage}%
              </p>
            </div>
            <div className="
              bg-black/40 
              rounded-lg 
              p-3 
              text-center
              hover:bg-black/50
              transition-colors
            ">
              <p className="text-xs text-white/60">Total Games</p>
              <p className="text-lg font-bold text-white">
                {rival.totalGames}
              </p>
            </div>
            <div className="
              bg-black/40 
              rounded-lg 
              p-3 
              text-center
              hover:bg-black/50
              transition-colors
            ">
              <p className="text-xs text-white/60">Avg WPM</p>
              <p className="text-lg font-bold text-white">
                {rival.averageWpm}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={() => onRivalSelect(rival.userId)}
              className="
                flex-1 
                bg-accent 
                text-white 
                py-2 
                rounded-lg 
                hover:bg-accent/90 
                transition-colors
                flex 
                items-center 
                justify-center
                gap-2
              "
            >
              Challenge Rival <ChevronRight size={18} />
            </button>
            <button 
              className="
                flex-1 
                bg-white/10 
                text-white 
                py-2 
                rounded-lg 
                hover:bg-white/20 
                transition-colors
              "
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="
      bg-black/10 
      rounded-2xl 
      p-6 
      border 
      border-white/10 
      space-y-6
    ">
      {/* Search and Filter Section */}
      <div className="flex space-x-4">
        <div className="
          flex 
          items-center 
          bg-black/30 
          rounded-full 
          px-4 
          py-2 
          flex-grow
        ">
          <Search 
            size={20} 
            className="text-white/60 mr-3" 
          />
          <input 
            type="text" 
            placeholder="Search rivals"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              bg-transparent 
              text-white 
              w-full 
              focus:outline-none 
              placeholder-white/40
            "
          />
        </div>

        <div className="flex space-x-2">
          {['all', 'recent', 'top'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`
                px-4 
                py-2 
                rounded-full 
                capitalize 
                transition-all
                ${filterMode === mode 
                  ? 'bg-accent text-white' 
                  : 'bg-black/30 text-white/60 hover:bg-black/40'}
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Rivals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white/80 flex items-center">
          <Users className="mr-3 text-accent" size={24} />
          Your Rivals
        </h2>

        {filteredRivals.length === 0 ? (
          <div className="
            bg-black/30 
            rounded-2xl 
            p-6 
            text-center 
            text-white/60
            flex 
            flex-col 
            items-center
          ">
            <Info className="mb-4 text-accent" size={36} />
            <p>No rivals found matching your search</p>
            <button 
              className="
                mt-4 
                bg-accent 
                text-white 
                px-6 
                py-2 
                rounded-full 
                flex 
                items-center 
                gap-2
                hover:bg-accent/90
                transition-colors
              "
            >
              <UserPlus size={20} /> Find New Rivals
            </button>
          </div>
        ) : (
          filteredRivals.map((rival) => (
            <div 
              key={rival.userId}
              onClick={() => setRivalDetailsModal(rival)}
              className={`
                bg-black/30 
                rounded-2xl 
                p-4 
                flex 
                items-center 
                justify-between
                cursor-pointer
                hover:bg-black/40
                transition-colors
                group
                ${currentActiveRivalId === rival.userId 
                  ? 'border-2 border-accent' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={rival.avatar} 
                  alt={rival.name} 
                  className={`
                    w-12 h-12 
                    rounded-full 
                    border-2 
                    transition-all
                    ${currentActiveRivalId === rival.userId 
                      ? 'border-accent' 
                      : 'border-transparent group-hover:border-white/30'}
                  `}
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{rival.name}</h3>
                  <p className="text-white/60 text-sm">
                    Win Rate: {rival.winPercentage}% • {rival.totalGames} Games
                  </p>
                </div>
              </div>
              <ChevronRight 
                className="
                  text-white/60 
                  group-hover:text-accent 
                  group-hover:translate-x-1 
                  transition-all
                " 
              />
            </div>
          ))
        )}
      </div>

      {/* Suggested Rivals Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white/80 flex items-center">
          <UserPlus className="mr-3 text-accent" size={24} />
          Suggested Rivals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedRivals.map((rival) => (
            <div 
              key={rival.userId}
              className="
                bg-black/30 
                rounded-2xl 
                p-4 
                text-center
                hover:bg-black/40
                transition-colors
                group
                cursor-pointer
              "
              onClick={() => setRivalDetailsModal(rival)}
            >
              <img 
                src={rival.avatar} 
                alt={rival.name} 
                className="
                  w-16 h-16 
                  rounded-full 
                  mx-auto 
                  mb-3
                  border-2 
                  border-transparent 
                  group-hover:border-accent
                  transition-all
                "
              />
              <h3 className="text-lg font-bold text-white">{rival.name}</h3>
              <p className="text-white/60 text-sm">
                Win Rate: {rival.winPercentage}%
              </p>
              <button 
                className="
                  mt-3 
                  bg-accent/20 
                  text-accent 
                  px-4 
                  py-2 
                  rounded-full 
                  hover:bg-accent/30
                  transition-colors
                  flex 
                  items-center 
                  justify-center 
                  gap-2
                  mx-auto
                "
              >
                Add Rival <UserPlus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rival Details Modal */}
      {rivalDetailsModal && (
        <RivalDetailsModal 
          rival={rivalDetailsModal} 
          onClose={() => setRivalDetailsModal(null)} 
        />
      )}
    </div>
  );
};

export default RivalsManagement;