import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Trophy, Calendar, Clock, Users, DollarSign, Save, X } from 'lucide-react';

const AdminCreateTournament = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId } = useParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tournamentName: '',
    gameName: '',
    gameImage: '',
    modeType: 'solo',
    scoringType: 'win_based',
    perKillAmount: '',
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
    rules: [''],
    prizes: [{ position: 1, amount: '' }]
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRulesChange = (index, value) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({
      ...prev,
      rules: newRules
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      rules: newRules.length > 0 ? newRules : ['']
    }));
  };

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      prizes: newPrizes
    }));
  };

  const addPrize = () => {
    const nextPosition = formData.prizes.length + 1;
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: nextPosition, amount: '' }]
    }));
  };

  const removePrize = (index) => {
    const newPrizes = formData.prizes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      prizes: newPrizes
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'tournamentName', 'gameName', 'entryFee', 'prizePool',
      'maxPlayers', 'matchDate', 'matchTime', 'duration', 'registrationDeadline'
    ];

    for (const field of requiredFields) {
      if (!formData[field] && field !== 'scoringType') { // scoringType has default value
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
        scoringType: formData.scoringType,
        perKillAmount: formData.scoringType === 'kill_based' ? parseFloat(formData.perKillAmount) || 0 : 0,
        entryFee: parseInt(formData.entryFee),
        prizePool: parseInt(formData.prizePool),
        maxPlayers: parseInt(formData.maxPlayers),
        minPlayers: parseInt(formData.minPlayers),
        duration: parseInt(formData.duration),
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        prizes: formData.prizes.filter(prize => prize.amount !== '').map(prize => ({
          position: parseInt(prize.position),
          amount: parseInt(prize.amount)
        }))
      };

      console.log('Creating tournament:', tournamentData);

      const response = await api.post('/tournaments', tournamentData);

      if (response.data.success) {
        toast.success('Tournament created successfully!');
        navigate(`/admin/tournament/all/${adminId}`);
      } else {
        throw new Error(response.data.message || 'Failed to create tournament');
      }

    } catch (error) {
      console.error('Create tournament error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create tournament';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
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
              Create Tournament
            </h1>
            <p className="text-blue-100 mt-1">Set up a new gaming tournament</p>
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
            </div>
          </div>

          {/* Scoring System */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scoring System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scoring Type *
                </label>
                <select
                  name="scoringType"
                  value={formData.scoringType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="win_based">Win Based (Simple winner)</option>
                  <option value="kill_based">Kill Based (Kills + Position)</option>
                  <option value="team_based">Team Based (Team win)</option>
                </select>
              </div>

              {formData.scoringType === 'kill_based' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Kill Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="perKillAmount"
                    value={formData.perKillAmount}
                    onChange={handleInputChange}
                    placeholder="Amount per kill"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
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

          {/* Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules</h2>
            <div className="space-y-3">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRulesChange(index, e.target.value)}
                    placeholder={`Rule ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRule}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Rule
              </button>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prize Distribution</h2>
            <div className="space-y-3">
              {formData.prizes.map((prize, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="number"
                      value={prize.position}
                      onChange={(e) => handlePrizeChange(index, 'position', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prize Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={prize.amount}
                      onChange={(e) => handlePrizeChange(index, 'amount', e.target.value)}
                      placeholder="1000"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {formData.prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="p-2 mt-5 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPrize}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Prize Position
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/adminPanel/${adminId}`)}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Tournament
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateTournament;