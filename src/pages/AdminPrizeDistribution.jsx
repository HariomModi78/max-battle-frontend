import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Trophy,
  DollarSign,
  Users,
  CheckCircle,
  X,
  Crown,
  Medal,
  Award,
  Save,
  UserX,
  UserCheck
} from 'lucide-react';

const AdminPrizeDistribution = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId, tournamentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [completedTournaments, setCompletedTournaments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [disqualified, setDisqualified] = useState([]);
  const [kills, setKills] = useState({});
  const [winningTeam, setWinningTeam] = useState([]);

  useEffect(() => {
    if (tournamentId && tournamentId !== 'all') {
      fetchTournamentDetails();
    } else {
      fetchCompletedTournaments();
    }
  }, [tournamentId]);

  const fetchCompletedTournaments = async () => {
    try {
      const response = await api.get('/tournaments', { params: { status: 'completed' } });
      if (response.data.success) {
        setCompletedTournaments(response.data.tournaments);
        setTournament(null);
        setParticipants([]);
        setWinners([]);
      }
    } catch (error) {
      console.error('Fetch tournaments error:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentDetails = async (id = tournamentId) => {
    try {
      setLoading(true);
      const [tournamentRes, playersRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/players`)
      ]);

      if (tournamentRes.data.success) {
        setTournament(tournamentRes.data.tournament);
      }

      if (playersRes.data.success) {
        setParticipants(playersRes.data.players || []);
        // Initialize winners array with existing winners or empty slots
        const existingWinners = tournamentRes.data.tournament?.winners || [];
        setWinners(existingWinners);
      }
    } catch (error) {
      console.error('Fetch tournament details error:', error);
      toast.error('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleWinnerSelection = (position, userId) => {
    // Don't allow selecting disqualified participants
    if (disqualified.includes(userId)) {
      toast.error('Cannot select disqualified participant');
      return;
    }

    const newWinners = [...winners];
    const positionIndex = position - 1;

    if (newWinners[positionIndex] === userId) {
      // Deselect if already selected
      newWinners[positionIndex] = null;
    } else {
      // Select new winner
      newWinners[positionIndex] = userId;
    }

    // Remove any duplicate selections
    for (let i = 0; i < newWinners.length; i++) {
      if (i !== positionIndex && newWinners[i] === userId) {
        newWinners[i] = null;
      }
    }

    setWinners(newWinners);
  };

  const handleDisqualifyParticipant = (userId) => {
    // Remove from winners if selected
    const newWinners = winners.map(winner => winner === userId ? null : winner);
    setWinners(newWinners);

    // Add to disqualified list
    if (!disqualified.includes(userId)) {
      setDisqualified([...disqualified, userId]);
      toast.success('Participant disqualified from prizes');
    }
  };

  const handleRequalifyParticipant = (userId) => {
    setDisqualified(disqualified.filter(id => id !== userId));
    toast.success('Participant requalified for prizes');
  };

  const handleKillChange = (userId, killCount) => {
    setKills({
      ...kills,
      [userId]: parseInt(killCount) || 0
    });
  };

  const handleTeamSelection = (userId) => {
    if (winningTeam.includes(userId)) {
      setWinningTeam(winningTeam.filter(id => id !== userId));
    } else {
      setWinningTeam([...winningTeam, userId]);
    }
  };

  const handleDistributePrizes = async () => {
    if (!tournament) return;

    setSaving(true);

    try {
      let distributionData = {
        scoringType: tournament.scoringType,
        disqualified: disqualified
      };

      if (tournament.scoringType === 'kill_based') {
        // Kill-based: winners with kills and position prizes
        const assignedWinners = winners.filter(winner => winner !== null && !disqualified.includes(winner));

        if (assignedWinners.length === 0) {
          toast.error('Please assign at least one eligible winner');
          return;
        }

        const killData = assignedWinners.map(userId => ({
          userId,
          kills: kills[userId] || 0
        }));

        distributionData = {
          ...distributionData,
          winners: assignedWinners,
          kills: killData,
          prizes: tournament.prizes || [],
          perKillAmount: tournament.perKillAmount || 0
        };

      } else if (tournament.scoringType === 'team_based') {
        // Team-based: distribute equally to winning team
        if (winningTeam.length === 0) {
          toast.error('Please select at least one team member');
          return;
        }

        const totalPrizePool = tournament.prizes?.reduce((sum, prize) => sum + prize.amount, 0) || 0;
        const prizePerMember = Math.floor(totalPrizePool / winningTeam.length);

        distributionData = {
          ...distributionData,
          winningTeam,
          totalPrizePool,
          prizePerMember
        };

      } else {
        // Win-based: simple winner selection
        const assignedWinners = winners.filter(winner => winner !== null && !disqualified.includes(winner));
        const availablePrizes = tournament.prizes?.length || 0;

        if (assignedWinners.length === 0) {
          toast.error('Please assign at least one eligible winner');
          return;
        }

        if (assignedWinners.length > availablePrizes) {
          toast.error('More winners assigned than available prizes');
          return;
        }

        distributionData = {
          ...distributionData,
          winners: assignedWinners,
          prizes: tournament.prizes || []
        };
      }

      console.log('Distributing prizes:', distributionData);

      const response = await api.post(`/admin/tournaments/${tournament._id}/distribute-prizes`, distributionData);

      if (response.data.success) {
        toast.success('Prizes distributed successfully!');
        navigate(`/admin/tournament/all/${adminId}`);
      } else {
        throw new Error(response.data.message || 'Failed to distribute prizes');
      }
    } catch (error) {
      console.error('Prize distribution error:', error);
      toast.error(error.response?.data?.message || 'Failed to distribute prizes');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const selectTournament = (selectedTournament) => {
    setTournament(selectedTournament);
    fetchTournamentDetails(selectedTournament._id);
  };

  if (loading) {
    return (
      <div className="pb-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
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
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={tournament ? () => {
              setTournament(null);
              setCompletedTournaments([]);
              setParticipants([]);
              setWinners([]);
              fetchCompletedTournaments();
            } : () => navigate(`/adminPanel/${adminId}`)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <DollarSign className="h-7 w-7 mr-3" />
              Prize Distribution
            </h1>
            <p className="text-yellow-100 mt-1">
              {tournament ? `Distribute prizes for ${tournament.tournamentName}` : 'Select a tournament to distribute prizes'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Tournament Selector */}
        {!tournament && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Tournament for Prize Distribution</h3>
            {completedTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTournaments.map((tournament) => (
                  <div
                    key={tournament._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => selectTournament(tournament)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{tournament.tournamentName}</h4>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tournament.gameName}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {tournament.currentPlayers} players
                      </span>
                      <span className="font-medium text-green-600">
                        ₹{tournament.prizePool?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Completed on {new Date(tournament.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed tournaments available for prize distribution</p>
                <p className="text-sm text-gray-400 mt-2">Tournaments must be completed before prizes can be distributed</p>
              </div>
            )}
          </div>
        )}

        {/* Tournament Info */}
        {tournament && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{tournament.tournamentName}</h2>
                <p className="text-gray-600">{tournament.gameName} • {tournament.modeType} • {tournament.matchType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Prize Pool</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(tournament.prizePool)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{participants.length} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-gray-400" />
                <span>{tournament.prizes?.length || 0} prize positions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Completed on {new Date(tournament.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Prize Positions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prize Positions</h3>
            <div className="space-y-3">
              {tournament?.prizes?.map((prize, index) => {
                const position = prize.position;
                const isAssigned = winners[position - 1];
                const assignedUser = isAssigned ? participants.find(p => p.userId._id === isAssigned) : null;

                return (
                  <div key={position} className={`p-4 rounded-lg border-2 transition-all ${
                    isAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getPositionIcon(position)}
                        <div>
                          <span className="font-medium text-gray-900">Position {position}</span>
                          <div className="text-lg font-bold text-green-600">{formatCurrency(prize.amount)}</div>
                        </div>
                      </div>
                      {isAssigned && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    {assignedUser ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {assignedUser.userId.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {assignedUser.userId.username}
                          </span>
                        </div>
                        <button
                          onClick={() => handleWinnerSelection(position, null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No winner assigned</p>
                    )}
                  </div>
                );
              }) || (
                <p className="text-gray-500 text-center py-4">No prize positions defined</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Winners</h3>
              {disqualified.length > 0 && (
                <div className="text-sm text-red-600 font-medium">
                  {disqualified.length} disqualified
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant, index) => {
                const isSelected = winners.includes(participant.user._id);
                const isDisqualified = disqualified.includes(participant.user._id);

                return (
                  <div
                    key={participant.user._id}
                    className={`p-3 rounded-lg border transition-all ${
                      isDisqualified
                        ? 'border-red-200 bg-red-50 opacity-75'
                        : isSelected
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    } ${!isDisqualified ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (isDisqualified) return;
                      // Find the first available position
                      const availablePosition = winners.findIndex(winner => winner === null || winner === undefined);
                      if (availablePosition !== -1) {
                        handleWinnerSelection(availablePosition + 1, participant.user._id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDisqualified ? 'bg-red-200' : 'bg-gray-200'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isDisqualified ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {participant.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDisqualified ? 'text-red-900 line-through' : 'text-gray-900'
                          }`}>
                            {participant.user.username}
                            {isDisqualified && <span className="ml-2 text-xs">(DISQUALIFIED)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(participant.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isSelected && !isDisqualified && (
                          <div className="text-blue-600">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                        {isDisqualified ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequalifyParticipant(participant.user._id);
                            }}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Requalify participant"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisqualifyParticipant(participant.user._id);
                            }}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Disqualify participant"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {participants.length === 0 && (
              <p className="text-gray-500 text-center py-8">No participants found</p>
            )}
          </div>

          {disqualified.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ Disqualified Participants</p>
                  <p>{disqualified.length} participant{disqualified.length > 1 ? 's' : ''} marked as disqualified will not receive any prizes during distribution.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => navigate(`/admin/tournament/all/${adminId}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDistributePrizes}
            disabled={saving || !tournament}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Distributing...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Distribute Prizes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPrizeDistribution;