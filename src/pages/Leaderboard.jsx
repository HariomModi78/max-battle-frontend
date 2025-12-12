import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, Calendar } from 'lucide-react';

const Leaderboard = () => {
  // No need for userId from params - user data comes from auth context
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly'); // monthly, all-time

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      // For now, use the general leaderboard endpoint
      // TODO: Add monthly/all-time filtering when backend supports it
      const response = await api.get('/users/leaderboard');
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Star className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const tabs = [
    { id: 'monthly', label: 'Monthly Winners', icon: Calendar },
    { id: 'all-time', label: 'All Time', icon: TrendingUp }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6">
        <div className="text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-yellow-100">Top performers this month</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{leaderboard.length}</div>
            <div className="text-xs opacity-90">Players</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {leaderboard.slice(0, 3).reduce((sum, player) => sum + (player.monthlyWinning || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs opacity-90">Top 3 Prizes</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl text-center">
            <Star className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {leaderboard[0]?.monthlyWinning?.toLocaleString('en-IN') || 0}
            </div>
            <div className="text-xs opacity-90">Champion</div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = user && player._id === user._id;

              return (
                <div
                  key={player._id}
                  className={`p-4 rounded-xl shadow-sm border transition-all duration-200 ${
                    isCurrentUser
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                      : getRankBgColor(rank)
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                      {getRankIcon(rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {player.username}
                          {isCurrentUser && <span className="text-xs text-blue-600 ml-2">(You)</span>}
                        </h3>
                        {rank <= 3 && (
                          <div className="flex space-x-1">
                            {[...Array(rank)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.totalKill || 0} kills • {player.totalMatch || 0} matches
                      </div>
                    </div>

                    {/* Prize Amount */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                        ₹{player.monthlyWinning?.toLocaleString('en-IN') || 0}
                      </div>
                      <div className="text-xs text-gray-500">Monthly Prize</div>
                    </div>
                  </div>

                  {/* Rank specific styling */}
                  {rank === 1 && (
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <div className="flex items-center justify-center space-x-2 text-yellow-700">
                        <Crown className="h-4 w-4" />
                        <span className="text-sm font-medium">Monthly Champion! 🏆</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
            <p className="text-gray-600">Leaderboards will be updated after tournaments.</p>
          </div>
        )}
      </div>

      {/* Current User Position */}
      {user && !leaderboard.some(player => player._id === user._id) && leaderboard.length > 0 && (
        <div className="px-4 pb-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Your Position</div>
              <div className="text-lg font-semibold text-gray-900">
                #{leaderboard.length + 1}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Keep playing to climb the leaderboard!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
