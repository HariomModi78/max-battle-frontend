import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Trophy,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Edit,
  Eye,
  Play,
  Pause,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const AdminTotalTournament = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId, status } = useParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(status || 'all');
  const [filterGame, setFilterGame] = useState('all');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [roomDetails, setRoomDetails] = useState({
    roomId: '',
    roomPassword: '',
    platform: 'custom'
  });

  useEffect(() => {
    fetchTournaments();
  }, [filterStatus]);

  const fetchTournaments = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await api.get('/tournaments', { params });

      if (response.data.success) {
        setTournaments(response.data.tournaments);
      }
    } catch (error) {
      console.error('Fetch tournaments error:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = (tournament) => {
    setSelectedTournament(tournament);
    setRoomDetails({
      roomId: tournament.roomDetails?.roomId || '',
      roomPassword: tournament.roomDetails?.roomPassword || '',
      platform: tournament.roomDetails?.platform || 'custom'
    });
    setShowRoomModal(true);
  };

  const handleSendRoomDetails = async () => {
    if (!selectedTournament) return;

    try {
      // First update tournament with room details
      const updateResponse = await api.put(`/tournaments/${selectedTournament._id}`, {
        roomDetails: roomDetails
      });

      if (updateResponse.data.success) {
        // Then send room details to participants
        const notifyResponse = await api.post(`/tournaments/${selectedTournament._id}/notify-room`, {
          roomId: roomDetails.roomId,
          roomPassword: roomDetails.roomPassword,
          platform: roomDetails.platform
        });

        if (notifyResponse.data.success) {
          // Finally start the tournament
          await updateTournamentStatus(selectedTournament._id, 'ongoing');
          setShowRoomModal(false);
          setSelectedTournament(null);
          toast.success('Room details sent and tournament started!');
        }
      }
    } catch (error) {
      console.error('Send room details error:', error);
      toast.error('Failed to send room details');
    }
  };

  const updateTournamentStatus = async (tournamentId, newStatus) => {
    try {
      const response = await api.put(`/tournaments/${tournamentId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setTournaments(tournaments.map(tournament =>
          tournament._id === tournamentId
            ? { ...tournament, status: newStatus }
            : tournament
        ));
        toast.success(`Tournament ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Update tournament status error:', error);
      toast.error('Failed to update tournament status');
    }
  };

  const deleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/tournaments/${tournamentId}`);

      if (response.data.success) {
        setTournaments(tournaments.filter(tournament => tournament._id !== tournamentId));
        toast.success('Tournament deleted successfully');
      }
    } catch (error) {
      console.error('Delete tournament error:', error);
      toast.error('Failed to delete tournament');
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.gameName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = filterGame === 'all' || tournament.gameName === filterGame;

    return matchesSearch && matchesGame;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ongoing':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get unique games for filter
  const uniqueGames = [...new Set(tournaments.map(t => t.gameName))];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/adminPanel/${adminId}`)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Trophy className="h-7 w-7 mr-3" />
              Tournament Management
            </h1>
            <p className="text-green-100 mt-1">Manage all tournaments on the platform</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tournaments</p>
                <p className="text-2xl font-bold text-gray-900">{tournaments.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tournaments.filter(t => t.status === 'upcoming').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ongoing</p>
                <p className="text-2xl font-bold text-green-600">
                  {tournaments.filter(t => t.status === 'ongoing').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {tournaments.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by tournament name or game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Games</option>
                {uniqueGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournaments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <div key={tournament._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Tournament Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {tournament.tournamentName}
                      </h3>
                      <p className="text-sm text-gray-600">{tournament.gameName}</p>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {getStatusIcon(tournament.status)}
                      <span className="ml-1 capitalize">{tournament.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(tournament.entryFee)}
                    </div>
                  </div>
                </div>

                {/* Tournament Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium capitalize">{tournament.modeType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prize Pool:</span>
                      <span className="font-medium text-green-600">{formatCurrency(tournament.prizePool)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(tournament.matchDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{tournament.matchTime}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/adminEditTournament/${adminId}/${tournament._id}`)}
                      className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/adminPrizeDistribute/${adminId}/${tournament._id}`)}
                      className="flex-1 bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center text-sm font-medium"
                      disabled={tournament.status !== 'completed'}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Prizes
                    </button>
                  </div>

                  {/* Status Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex space-x-1">
                      {tournament.status === 'upcoming' && (
                        <button
                          onClick={() => handleStartTournament(tournament)}
                          className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center text-xs font-medium"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </button>
                      )}

                      {tournament.status === 'ongoing' && (
                        <button
                          onClick={() => updateTournamentStatus(tournament._id, 'completed')}
                          className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-xs font-medium"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </button>
                      )}

                      {tournament.status !== 'cancelled' && tournament.status !== 'completed' && (
                        <button
                          onClick={() => updateTournamentStatus(tournament._id, 'cancelled')}
                          className="flex-1 bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center text-xs font-medium"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => deleteTournament(tournament._id)}
                        className="bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center text-xs font-medium"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTournaments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tournaments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tournament Room Details</h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room ID *
                </label>
                <input
                  type="text"
                  value={roomDetails.roomId}
                  onChange={(e) => setRoomDetails({...roomDetails, roomId: e.target.value})}
                  placeholder="Enter room ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Password
                </label>
                <input
                  type="text"
                  value={roomDetails.roomPassword}
                  onChange={(e) => setRoomDetails({...roomDetails, roomPassword: e.target.value})}
                  placeholder="Enter room password (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={roomDetails.platform}
                  onChange={(e) => setRoomDetails({...roomDetails, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="custom">Custom</option>
                  <option value="pubg_mobile">PUBG Mobile</option>
                  <option value="free_fire">Free Fire</option>
                  <option value="cod_mobile">COD Mobile</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Room details will be sent to all participants</p>
                    <p>Make sure the room ID and password are correct before starting the tournament.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRoomModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRoomDetails}
                disabled={!roomDetails.roomId.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send & Start Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalTournament;