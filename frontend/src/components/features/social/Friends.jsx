import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from "jwt-decode";
import { 
  Trophy, Users, Timer, UserCircle2, Swords, 
  Star, Flame 
} from 'lucide-react';
import friendService from '../../../services/friendService';
import BattleCard from '../../ui/BattleCard';
import LoadingErrorState from '../../ui/LoadingErrorState';
import Pagination from '../../ui/Pagination';


// Animated Stat Badge
const StatBadge = ({ icon: Icon, title, value, className = '' }) => (
  <div className={`flex items-center space-x-3 bg-black/30 rounded-xl px-4 py-2 ${className}`}>
    <Icon className="w-6 h-6 text-accent opacity-80 transform transition-transform group-hover:scale-110" />
    <div>
      <p className="text-xs uppercase tracking-wider text-white/60">{title}</p>
      <p className="text-white font-bold">{value}</p>
    </div>
  </div>
);

// Rival Performance Card with Enhanced Animations
const RivalPerformanceCard = ({ rival, games, isActive = false }) => {
  const totalGames = games.length;
  const wins = games.filter(game => game.outcome === 'win').length;
  const winPercentage = totalGames > 0 
    ? Math.round((wins / totalGames) * 100) 
    : 0;

  return (
    <div 
      className={`
        bg-black/30 rounded-3xl p-6 border transition-all duration-300
        ${isActive 
          ? 'border-accent/50 scale-105 shadow-2xl' 
          : 'border-white/10 hover:border-accent/30 hover:scale-[1.02]'}
      `}
    >
      <div className="flex items-center space-x-4 mb-4">
        <UserCircle2 
          className={`
            w-16 h-16 transition-colors duration-300
            ${isActive ? 'text-accent' : 'text-accent/70'}
          `} 
        />
        <div>
          <h3 className="text-xl font-bold text-white">{rival.name}</h3>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-white/60">
              Games: <span className="text-white font-semibold">{totalGames}</span>
            </span>
            <span className="text-white/60">
              Wins: <span className="text-accent font-semibold">{wins}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Performance Visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Win Percentage</span>
          <span className="text-sm font-bold text-accent">{winPercentage}%</span>
        </div>
        <div className="w-full bg-black/40 rounded-xl h-2">
          <div 
            className="bg-accent rounded-xl h-2 transition-all duration-500" 
            style={{ width: `${winPercentage}%` }}
          />
        </div>
      </div>

      {/* Recent Matches */}
      <div>
        <h4 className="text-sm text-white/60 mb-3">Recent Matches</h4>
        <div className="space-y-2">
          {games.slice(0, 2).map((game) => (
            <div 
              key={game.roomId} 
              className="flex items-center justify-between bg-black/40 rounded-lg p-2 hover:bg-black/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Swords 
                  className={`
                    w-5 h-5 transition-colors
                    ${game.outcome === 'win' 
                      ? 'text-accent animate-pulse' 
                      : 'text-white/50'}
                  `} 
                />
                <span className="text-sm text-white/80">
                  {game.contentType} - {game.difficulty}
                </span>
              </div>
              <span 
                className={`
                  text-sm font-semibold transition-colors
                  ${game.outcome === 'win' 
                    ? 'text-accent animate-pulse' 
                    : 'text-white/60'}
                `}
              >
                {game.outcome === 'win' ? 'Won' : 'Lost'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FriendsPerformanceView = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Pagination and Active Rival States
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRivalId, setActiveRivalId] = useState(null);
  const gamesPerPage = 2;
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
        
        const loadUserStats = async () => {
          try {
            setLoading(true);
            const userId = decoded.id || decoded._id;
            const stats = await friendService.getUserMultiplayerStats(userId);
            
            setUserStats(stats);
            // Set first rival as active by default
            if (stats.opponents.length > 0) {
              setActiveRivalId(stats.opponents[0].userId);
            }
            setError(null);
          } catch (err) {
            console.error('Failed to load multiplayer stats:', err);
            setError(err.response?.data?.error || 'Failed to load stats');
          } finally {
            setLoading(false);
          }
        };
        
        loadUserStats();
      } catch (err) {
        console.error('Token decoding error:', err);
        setError('Authentication error');
        setLoading(false);
      }
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, []);
  
  // Paginated Games for Active Rival
  const paginatedGames = useMemo(() => {
    if (!userStats?.recentGames) return [];
    
    // Filter games for active rival if selected
    const rivalGames = activeRivalId 
      ? userStats.recentGames.filter(game => 
          game.opponentPerformance?.userId === activeRivalId ||
          game.playerPerformance?.userId === activeRivalId
        )
      : userStats.recentGames;
    
    const startIndex = (currentPage - 1) * gamesPerPage;
    return rivalGames.slice(startIndex, startIndex + gamesPerPage);
  }, [userStats, currentPage, activeRivalId]);
  
  // Total Pages Calculation
  const totalPages = useMemo(() => {
    if (!userStats?.recentGames) return 0;
    
    const rivalGames = activeRivalId 
      ? userStats.recentGames.filter(game => 
          game.opponentPerformance?.userId === activeRivalId ||
          game.playerPerformance?.userId === activeRivalId
        )
      : userStats.recentGames;
    
    return Math.ceil(rivalGames.length / gamesPerPage);
  }, [userStats, activeRivalId]);
  
  // Loading or error state
  if (loading || error) {
    return <LoadingErrorState loading={loading} error={error} />;
  }
  
  // No stats available
  if (!userStats || !userStats.opponents || userStats.opponents.length === 0) {
    return (
      
      <div className="min-h-screen bg-black/5 backdrop-blur-xl rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 flex items-center justify-center p-4">
        <div className="text-center bg-black/30 backdrop-blur-md rounded-3xl p-12 max-w-md w-full">
          <Star className="mx-auto mb-6 w-16 h-16 text-accent/70" />
          <h1 className="text-3xl font-bold text-white mb-4">No Multiplayer Games Yet</h1>
          <p className="text-white/60 mb-6">Start challenging your friends and track your progress!</p>
          <button className="px-8 py-3 bg-accent hover:bg-accent/90 transition-colors text-white rounded-xl font-semibold shadow-lg">
            Find Friends to Play
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className=" bg-black/5 backdrop-blur-xl rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 text-white p-8 py-4 ">
      <div className="max-w-7xl mx-auto">
        {/* Header with Overall Performance */}
        <header className="text-center  flex justify-between">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Multiplayer Performance
          </h1>
          <div className="flex justify-center space-x-8 mb-6">
            <StatBadge 
              icon={Trophy} 
              title="Win Rate" 
              value={`${userStats.summary.winRate}%`} 
            />
            <StatBadge 
              icon={Users} 
              title="Total Games" 
              value={userStats.summary.totalGames} 
            />
            <StatBadge 
              icon={Flame} 
              title="Avg WPM" 
              value={userStats.summary.averageWpm} 
            />
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Rivals Column */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-white/80 mb-4">Your Rivals</h2>
            {userStats.opponents.map((rival) => {
              // Find games specific to this rival
              const rivalGames = userStats.recentGames.filter(game => 
                game.opponentPerformance?.userId === rival.userId ||
                game.playerPerformance?.userId === rival.userId
              );
              
              return (
                <div 
                  key={rival.userId}
                  onClick={() => {
                    setActiveRivalId(rival.userId);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer"
                >
                  <RivalPerformanceCard 
                    rival={rival} 
                    games={rivalGames} 
                    isActive={activeRivalId === rival.userId}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Recent Games Column */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white/80">Recent Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {paginatedGames.map((game) => (
                <BattleCard
                  key={game.roomId}
                  game={game}
                  isWinner={game.outcome === 'win'}
                  currentUserId={currentUser?.id || currentUser?._id}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPerformanceView;