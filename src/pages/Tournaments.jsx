import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  Filter,
  Search,
  Clock,
  Users,
  Target,
  MapPin,
  Calendar,
  IndianRupee,
  Play,
  Crown,
  ArrowLeft,
  Gamepad2
} from 'lucide-react';

const Tournaments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    game: 'all',
    entryFee: 'all',
    minEntryFee: 'all'
  });

  useEffect(() => {
    // Parse URL parameters for initial filters
    const urlParams = new URLSearchParams(location.search);
    const type = urlParams.get('type') || 'all';
    const game = urlParams.get('game') || 'all';
    const entryFee = urlParams.get('entryFee') || 'all';
    const minEntryFee = urlParams.get('minEntryFee') || 'all';

    setFilters({ type, game, entryFee, minEntryFee });
    fetchTournaments({ type, game, entryFee, minEntryFee });
  }, [location.search]);

  const fetchTournaments = async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterParams.type && filterParams.type !== 'all') {
        params.append('type', filterParams.type);
      }
      if (filterParams.game && filterParams.game !== 'all') {
        params.append('game', filterParams.game);
      }
      if (filterParams.entryFee && filterParams.entryFee !== 'all') {
        params.append('entryFee', filterParams.entryFee);
      }
      if (filterParams.minEntryFee && filterParams.minEntryFee !== 'all') {
        params.append('minEntryFee', filterParams.minEntryFee);
      }

      const response = await api.get(`/tournaments?${params.toString()}`);
      setTournaments(response.data.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== 'all') params.append(key, val);
    });

    navigate(`/tournaments?${params.toString()}`, { replace: true });
    fetchTournaments(newFilters);
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
        return <Crown className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const TournamentCard = ({ tournament }) => (
    <Link
      to={`/tournament/detail/${tournament._id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 block"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {tournament.tournamentName}
          </h3>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
            {getStatusIcon(tournament.status)}
            <span className="capitalize">{tournament.status}</span>
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
          <span>{tournament.currentPlayers || 0}/{tournament.maxPlayers}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Target className="h-4 w-4" />
          <span>{tournament.modeType}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Gamepad2 className="h-4 w-4" />
          <span>{tournament.gameName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">
            {new Date(tournament.matchDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-900">
          Entry: {tournament.entryFee === 0 ? 'Free' : `₹${tournament.entryFee}`}
        </div>
        <div className="text-xs text-gray-500">
          {tournament.description?.slice(0, 30)}...
        </div>
      </div>
    </Link>
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Browse Tournaments</h1>
            <p className="text-blue-100">Find and join tournaments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{tournaments.length}</div>
            <div className="text-xs opacity-90">
              {filters.type === 'all' ? 'Total Tournaments' :
               filters.type === 'free' ? 'Free Tournaments' :
               `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Tournaments`}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Game</label>
              <select
                value={filters.game}
                onChange={(e) => handleFilterChange('game', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Games</option>
                <option value="pubg mobile">PUBG Mobile</option>
                <option value="free fire">Free Fire</option>
                <option value="clash">Clash Squad</option>
                <option value="cod">COD Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entry Fee</label>
              <select
                value={filters.entryFee}
                onChange={(e) => handleFilterChange('entryFee', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Any Fee</option>
                <option value="0">Free</option>
                <option value="gt:0">Paid</option>
                <option value="1">₹1</option>
                <option value="10">₹10+</option>
                <option value="50">₹50+</option>
              </select>
            </div>
          </div>
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
        ) : tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new tournaments.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
