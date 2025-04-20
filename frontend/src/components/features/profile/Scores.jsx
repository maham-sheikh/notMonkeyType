import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import {fetchUserGameSessions} from '../../../services/gameSessionService';
import Table from '../../ui/Table';
import LoadingErrorState from '../../ui/LoadingErrorState';

const Scores = () => {
  const [userGameSessions, setUserGameSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  
  const fetchUserScores = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user name from token
      const token = localStorage.getItem('token');
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || decoded.firstName || 'User');
      } catch (err) {
        // Silently handle token decode errors
      }
      
      // Fetch user's game sessions using the service
      const data = await fetchUserGameSessions();
      
      // Sort by score in descending order
      const sortedData = [...data].sort((a, b) => b.score - a.score);
      
      // Add rank attribute based on sorted order
      const rankedData = sortedData.map((session, index) => ({
        ...session,
        rank: index + 1 // Rank starts at 1
      }));
      
      setUserGameSessions(rankedData);
    } catch (error) {
      setError(error.message || 'Failed to fetch game sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserScores();
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

  // Generate a personalized title
  const title = userName ? `${userName}'s Scores` : 'Your Scores';

  return (
    <div className="max-w-screen-xl mx-auto mb-40 p-5">
      <LoadingErrorState
        loading={loading}
        error={error}
        title={title}
        loadingMessage="Loading your score history..."
        errorMessage="Failed to load scores: "
        onRetry={fetchUserScores}
      >
        {userGameSessions.length === 0 ? (
          <div className="rounded-lg shadow-lg backdrop-blur-lg bg-white/10 p-6">
            <h2 className="text-white text-4xl font-extrabold tracking-tighter mb-6">{title}</h2>
            <div className="flex justify-center items-center min-h-[400px] text-center">
              <div className="text-white text-xl max-w-lg">
                <p className="mb-4">No score records found.</p>
                <p>Play some games to see your scores and track your typing progress!</p>
              </div>
            </div>
          </div>
        ) : (
          <Table 
            title={title}
            columns={columns} 
            data={userGameSessions}
            initialSortKey="score"
            initialSortDirection="desc"
          />
        )}
      </LoadingErrorState>
    </div>
  );
};

export default Scores;