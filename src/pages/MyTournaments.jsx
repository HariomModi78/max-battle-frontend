import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  Clock,
  Play,
  CheckCircle,
  Calendar,
  Users,
  Target,
  MapPin,
  Crown,
  Star,
  Filter
} from 'lucide-react';

const MyTournaments = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('MyTournaments component rendered with path:', location.pathname, 'userId:', userId);
  const [tournaments, setTournaments] = useState({
    upcoming: [],
    ongoing: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);

  // Determine initial active tab based on URL params or default to upcoming
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['upcoming', 'ongoing', 'completed'].includes(tab)) {
      return tab;
    }
    return 'upcoming';
  };

  const [activeTab, setActiveTab] = useState(() => {
    const initialTab = getInitialTab();
    console.log('Initial active tab set to:', initialTab);
    return initialTab;
  });

  useEffect(() => {
    fetchMyTournaments();
  }, []);

  // Update active tab when route changes
  useEffect(() => {
    const newTab = getInitialTab();
    console.log('URL params changed, setting active tab to:', newTab);
      setActiveTab(newTab);
  }, [location.search]);

  const fetchMyTournaments = async () => {
    try {
      const response = await api.get('/users/my-tournaments');
      console.log('My tournaments response:', response.data);

      // Categorize tournaments by status
      const categorizedTournaments = {
        upcoming: response.data.tournaments.filter(t => t.status === 'upcoming') || [],
        ongoing: response.data.tournaments.filter(t => t.status === 'ongoing') || [],
        completed: response.data.tournaments.filter(t => t.status === 'completed') || []
      };

      console.log('Categorized tournaments:', categorizedTournaments);
      setTournaments(categorizedTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'ongoing':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TournamentCard = ({ tournament, status }) => (
    <Link
      to={`/tournament/detail/${tournament._id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 block"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {tournament.description}
          </h3>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-lg font-bold text-gray-900">
            ₹{tournament.prizePool?.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">Prize Pool</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>{tournament.slotsFilled || 0}/{tournament.totalSlots}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Target className="h-4 w-4" />
          <span>₹{tournament.perKillAmount}/kill</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>{tournament.map}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">
            {new Date(tournament.dateAndTime).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {status === 'completed' && tournament.leaderboard && (
        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-1 text-green-700">
            <Crown className="h-4 w-4" />
            <span className="text-xs font-medium">Tournament Completed</span>
          </div>
        </div>
      )}

      {status === 'ongoing' && (
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-1 text-blue-700">
            <Play className="h-4 w-4" />
            <span className="text-xs font-medium">Tournament Live</span>
          </div>
        </div>
      )}
    </Link>
  );

  const tabs = useMemo(() => [
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: Clock,
      count: tournaments.upcoming.length,
      color: 'blue'
    },
    {
      id: 'ongoing',
      label: 'Ongoing',
      icon: Play,
      count: tournaments.ongoing.length,
      color: 'green'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: tournaments.completed.length,
      color: 'purple'
    }
  ], [tournaments.upcoming.length, tournaments.ongoing.length, tournaments.completed.length]);

  const currentTournaments = tournaments[activeTab];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">My Tournaments</h1>
            <p className="text-blue-100">Track your gaming journey</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{tournaments.upcoming.length}</div>
            <div className="text-xs opacity-90">Upcoming</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{tournaments.ongoing.length}</div>
            <div className="text-xs opacity-90">Live</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{tournaments.completed.length}</div>
            <div className="text-xs opacity-90">Completed</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 flex">
          {console.log('Rendering tabs:', tabs.length, 'tabs, active:', activeTab, 'tabs:', tabs.map(t => t.id))}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('Clicked tab:', tab.id, 'Current active:', activeTab);
                  setActiveTab(tab.id);
                  // Update URL params instead of navigating to different routes
                  const url = new URL(window.location);
                  url.searchParams.set('tab', tab.id);
                  window.history.pushState({}, '', url);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-white shadow-sm`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ minHeight: '44px' }} // Ensure button has minimum touch target
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tournament List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentTournaments.length > 0 ? (
          <div className="space-y-4">
            {currentTournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                status={activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              {activeTab === 'upcoming' && <Clock className="h-8 w-8 text-gray-400" />}
              {activeTab === 'ongoing' && <Play className="h-8 w-8 text-gray-400" />}
              {activeTab === 'completed' && <Trophy className="h-8 w-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} tournaments
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' && 'You haven\'t joined any upcoming tournaments yet'}
              {activeTab === 'ongoing' && 'You don\'t have any live tournaments right now'}
              {activeTab === 'completed' && 'Complete your first tournament to see it here'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                to={`/home/${userId}`}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Trophy className="h-5 w-5" />
                <span>Browse Tournaments</span>
              </Link>
            )}
          </div>
        )}

        {/* Performance Stats */}
        {tournaments.completed.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Your Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user?.totalKill || 0}
                </div>
                <div className="text-sm text-blue-700">Total Kills</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{(user?.winning || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-green-700">Total Winnings</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTournaments;