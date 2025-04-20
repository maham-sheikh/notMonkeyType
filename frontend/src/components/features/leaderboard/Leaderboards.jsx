import React, { useEffect, useState } from 'react';
import {fetchGameSessions} from '../../../services/gameSessionService';
import Table from '../../ui/Table';
import LoadingErrorState from '../../ui/LoadingErrorState';

const Leaderboards = () => {
  const [userGameSessions, setUserGameSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchGameSessions();
      
      // 1. Sort by score in descending order
      const sortedData = [...data].sort((a, b) => b.score - a.score);
      
      // 2. Add rank attribute based on sorted order
      const rankedData = sortedData.map((session, index) => ({
        ...session,
        rank: index + 1 // Rank starts at 1
      }));
      
      setUserGameSessions(rankedData);
    } catch (error) {
      setError(error.message || 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const columns = [
    { label: 'Rank', key: 'rank', type: 'number' },
    { label: 'User', key: 'email' },
    { label: 'WPM', key: 'wpm', type: 'number' },
    { label: 'Accuracy', key: 'accuracy', type: 'number' },
    { label: 'Date', key: 'createdAt', type: 'date' },
    { label: 'Time Interval', key: 'sessionTime', type: 'number' },
    { label: 'Score', key: 'score', type: 'number' },
  ];

  return (
    <div className="max-w-screen-xl mx-auto mb-40 p-5">
      <LoadingErrorState
        loading={loading}
        error={error}
        title="LeaderBoard"
        loadingMessage="Loading leaderboard data..."
        errorMessage="Failed to load leaderboard: "
        onRetry={fetchLeaderboardData}
      >
        <Table 
          title="LeaderBoard" 
          columns={columns} 
          data={userGameSessions}
          initialSortKey="score"
          initialSortDirection="desc"
        />
      </LoadingErrorState>
    </div>
  );
};

export default Leaderboards;