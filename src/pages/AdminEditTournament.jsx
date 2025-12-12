import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Trophy, Save, X } from 'lucide-react';

const AdminEditTournament = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId, tournamentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    tournamentName: '',
    gameName: '',
    gameImage: '',
    modeType: 'solo',
    matchType: 'battle_royale',
    entryFee: '',
    prizePool: '',
    maxPlayers: '',
    minPlayers: 2,
    matchDate: '',
    matchTime: '',
    duration: '',
    registrationDeadline: '',
    description: '',
    status: 'upcoming'
  });

  const gameOptions = [
    'PUBG Mobile',
    'Free Fire',
    'Call of Duty Mobile',
    'Asphalt 9',
    'Mobile Legends',
    'Arena of Valor',
    'Clash Royale',
    'Brawl Stars',
    'Other'
  ];

  const modeOptions = [
    { value: 'solo', label: 'Solo' },
    { value: 'duo', label: 'Duo' },
    { value: 'squad', label: 'Squad' }
  ];

  const matchTypeOptions = [
    { value: 'battle_royale', label: 'Battle Royale' },
    { value: 'ranked', label: 'Ranked Match' },
    { value: 'casual', label: 'Casual Match' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'custom', label: 'Custom Match' }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}`);
      if (response.data.success) {
        const tournament = response.data.tournament;
        setFormData({
          tournamentName: tournament.tournamentName || '',
          gameName: tournament.gameName || '',
          gameImage: tournament.gameImage || '',
          modeType: tournament.modeType || 'solo',
          matchType: tournament.matchType || 'battle_royale',
          entryFee: tournament.entryFee?.toString() || '',
          prizePool: tournament.prizePool?.toString() || '',
          maxPlayers: tournament.maxPlayers?.toString() || '',
          minPlayers: tournament.minPlayers || 2,
          matchDate: tournament.matchDate ? new Date(tournament.matchDate).toISOString().split('T')[0] : '',
          matchTime: tournament.matchTime || '',
          duration: tournament.duration?.toString() || '',
          registrationDeadline: tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toISOString().slice(0, 16) : '',
          description: tournament.description || '',
          status: tournament.status || 'upcoming'
        });
      }
    } catch (error) {
      console.error('Fetch tournament error:', error);
      toast.error('Failed to load tournament details');
      navigate(`/admin/tournament/all/${adminId}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'tournamentName', 'gameName', 'entryFee', 'prizePool',
      'maxPlayers', 'matchDate', 'matchTime', 'duration', 'registrationDeadline'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }

    if (parseInt(formData.entryFee) < 0) {
      toast.error('Entry fee cannot be negative');
      return false;
    }

    if (parseInt(formData.prizePool) < parseInt(formData.entryFee)) {
      toast.error('Prize pool must be at least equal to entry fee');
      return false;
    }

    if (parseInt(formData.maxPlayers) < parseInt(formData.minPlayers)) {
      toast.error('Max players must be greater than min players');
      return false;
    }

    const matchDateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);
    const registrationDeadline = new Date(formData.registrationDeadline);

    if (registrationDeadline >= matchDateTime) {
      toast.error('Registration deadline must be before match start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare data for submission
      const tournamentData = {
        ...formData,
        entryFee: parseInt(formData.entryFee),
        prizePool: parseInt(formData.prizePool),
        maxPlayers: parseInt(formData.maxPlayers),
        minPlayers: parseInt(formData.minPlayers),
        duration: parseInt(formData.duration)
      };

      console.log('Updating tournament:', tournamentData);

      const response = await api.put(`/tournaments/${tournamentId}`, tournamentData);

      if (response.data.success) {
        toast.success('Tournament updated successfully!');
        navigate(`/admin/tournament/all/${adminId}`);
      } else {
        throw new Error(response.data.message || 'Failed to update tournament');
      }

    } catch (error) {
      console.error('Update tournament error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update tournament';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (fetchLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tournament details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/admin/tournament/all/${adminId}`)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Trophy className="h-7 w-7 mr-3" />
              Edit Tournament
            </h1>
            <p className="text-blue-100 mt-1">Update tournament details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleInputChange}
                  placeholder="e.g., PUBG Mobile Championship"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Name *
                </label>
                <select
                  name="gameName"
                  value={formData.gameName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Game</option>
                  {gameOptions.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode Type *
                </label>
                <select
                  name="modeType"
                  value={formData.modeType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {modeOptions.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Type *
                </label>
                <select
                  name="matchType"
                  value={formData.matchType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {matchTypeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Fee (₹) *
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  placeholder="0 for free tournament"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Pool (₹) *
                </label>
                <input
                  type="number"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                  placeholder="5000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Players *
                </label>
                <input
                  type="number"
                  name="minPlayers"
                  value={formData.minPlayers}
                  onChange={handleInputChange}
                  placeholder="2"
                  min="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players *
                </label>
                <input
                  type="number"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Date *
                </label>
                <input
                  type="date"
                  name="matchDate"
                  value={formData.matchDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Time *
                </label>
                <input
                  type="time"
                  name="matchTime"
                  value={formData.matchTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the tournament rules, format, and any special instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/tournament/all/${adminId}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Tournament
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditTournament;