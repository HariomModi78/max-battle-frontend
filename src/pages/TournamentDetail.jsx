import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  ArrowLeft,
  XCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  MapPin,
  Target,
  Award,
  AlertTriangle,
  BookOpen,
  Shield,
  Zap,
  Eye,
  EyeOff,
  User,
  RefreshCw,
  X
} from 'lucide-react';

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userSlot, setUserSlot] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchTournamentDetail();
  }, []);

  const fetchTournamentDetail = async (showErrorToast = true) => {
    try {
      console.log('Fetching tournament details for ID:', tournamentId);
      const response = await api.get(`/tournaments/${tournamentId}`);
      console.log('Tournament data received:', response.data);

      const tournamentData = response.data.tournament;
      setTournament(tournamentData);

      // Check if user has already joined
      const slot = user?._id ? tournamentData.slots?.find(slot => slot.userId === user._id) : null;
      console.log('User slot found:', slot);
      setUserSlot(slot);

      if (showErrorToast) {
        toast.success('Tournament data refreshed');
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      console.error('Error response:', error.response);

      if (showErrorToast) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load tournament details';
        toast.error(`Refresh failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (slotNumber = null) => {
    if (!tournament) return;

    setJoining(true);
    try {
      console.log('Attempting to join tournament:', tournamentId, 'slot:', slotNumber);
      const response = await api.post(`/tournaments/${tournamentId}/join`, {
        slotNumber: slotNumber
      });
      console.log('Join response status:', response.status);
      console.log('Join response:', response);
      console.log('Join response data:', response.data);

      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        toast.success('Successfully joined tournament!');
        setShowSlotSelection(false);
        setSelectedSlot(null);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }

      // Immediately refresh tournament data to show updated status
      console.log('Refreshing tournament data after join...');
      await fetchTournamentDetail(false); // Silent refresh, no error toasts

    } catch (error) {
      console.error('Join tournament error:', error);
      console.error('Join tournament error response:', error.response);
      console.error('Join tournament error response data:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pb-20">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="pb-20">
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Tournament Not Found</h2>
          <p className="text-secondary-600 mb-4">The tournament you're looking for doesn't exist.</p>
          <Link
            to="/home"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = tournament.status === 'completed';
  const canJoin = tournament.status === 'upcoming' && !userSlot && (tournament.currentPlayers || 0) < (tournament.maxPlayers || 0);
  const isFull = (tournament.currentPlayers || 0) >= (tournament.maxPlayers || 0);

  return (
    <div className="pb-20 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center justify-between">
          <Link
            to="/home"
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold">Tournament Details</h1>
            <p className="text-sm opacity-90">{tournament.description || 'Tournament'}</p>
          </div>
          <button
            onClick={() => fetchTournamentDetail(true)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Refresh tournament data"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tournament Info Card */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{tournament.description || 'Tournament'}</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament.status === 'upcoming' ? 'Upcoming' :
               tournament.status === 'ongoing' ? 'Live' : 'Completed'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="font-medium text-gray-600">Prize Pool</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(tournament.prizePool)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium text-gray-600">Entry Fee</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(tournament.entryFee)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <div className="font-medium text-gray-600">Players</div>
                <div className="text-lg font-bold">{tournament.currentPlayers || 0}/{tournament.maxPlayers || 0}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <div>
                <div className="font-medium text-gray-600">Match Date</div>
                <div className="text-sm font-medium">{formatDate(tournament.matchDate)}</div>
              </div>
            </div>
          </div>

          {tournament.map && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium text-gray-600">Map:</span>
                <span className="text-gray-800">{tournament.map}</span>
              </div>
            </div>
          )}

          {tournament.modeType && (
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-gray-600">Mode:</span>
              <span className="text-gray-800">{tournament.modeType.toUpperCase()} - {tournament.matchType || 'Unknown'}</span>
            </div>
          )}
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-800">
                {tournament.scoringType === 'team_based' ? 'Teams' : 'Participants'} ({tournament.slots ? tournament.slots.filter(slot => slot.userId).length : 0}/{tournament.maxPlayers || 0})
              </span>
            </div>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              {showParticipants ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </>
              )}
            </button>
          </div>

          {showParticipants && (
            <div className="border-t border-gray-200 pt-4">
              {tournament.slots && tournament.slots.filter(slot => slot.userId).length > 0 ? (
                <div className="space-y-4">
                  {tournament.scoringType === 'team_based' ? (
                    // Team-based display
                    (() => {
                      const filledSlots = tournament.slots.filter(slot => slot.userId);
                      const teamSize = tournament.modeType === 'duo' ? 2 : tournament.modeType === 'squad' ? 4 : 3;
                      const teams = [];

                      for (let i = 0; i < filledSlots.length; i += teamSize) {
                        teams.push(filledSlots.slice(i, i + teamSize));
                      }

                      return teams.map((team, teamIndex) => (
                        <div key={teamIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              Team {teamIndex + 1}
                            </div>
                            <span className="font-medium text-blue-900">
                              {team.length}/{teamSize} Players
                            </span>
                          </div>
                          <div className="space-y-2">
                            {team.map((slot, playerIndex) => (
                              <div key={slot._id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {playerIndex + 1}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {slot.userId?.gameName || slot.username || 'Anonymous Player'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Joined: {slot.joinedAt ? new Date(slot.joinedAt).toLocaleString('en-IN') : 'Recently'}
                                    </div>
                                  </div>
                                </div>
                                {user?._id && slot.userId === user._id && (
                                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    You
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    // Individual player display (for other scoring types)
                    <div className="grid gap-3">
                      {tournament.slots.filter(slot => slot.userId).map((slot, index) => (
                        <div
                          key={slot._id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {slot.userId?.gameName || slot.username || 'Anonymous Player'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined: {slot.joinedAt ? new Date(slot.joinedAt).toLocaleString('en-IN') : 'Recently'}
                              </div>
                            </div>
                          </div>
                          {user?._id && slot.userId === user._id && (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              You
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No participants yet</p>
                  <p className="text-sm">Be the first to join!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Join Tournament Section */}
        {!isCompleted && (
          <div className="bg-white rounded-lg p-4 shadow-md">
            {userSlot ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">You're In!</h3>
                <p className="text-gray-600 mb-4">
                  You have successfully joined this tournament. Good luck!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-1">Your Slot Details:</div>
                    <div>Joined: {userSlot.joinedAt ? new Date(userSlot.joinedAt).toLocaleString('en-IN') : 'Recently'}</div>
                    {userSlot.roomId && <div>Room ID: {userSlot.roomId}</div>}
                    {userSlot.roomPassword && <div>Password: {userSlot.roomPassword}</div>}
                  </div>
                </div>
              </div>
            ) : canJoin ? (
              <div className="text-center py-6">
                <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Book Your Slot</h3>
                <p className="text-gray-600 mb-6">
                  Entry Fee: <span className="font-bold text-blue-600">{formatCurrency(tournament.entryFee)}</span>
                </p>
                <button
                  onClick={() => {
                    if (tournament.scoringType === 'team_based') {
                      setShowSlotSelection(true);
                    } else {
                      handleJoinTournament();
                    }
                  }}
                  disabled={joining}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5" />
                      <span>Book Slot - {formatCurrency(tournament.entryFee)}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isFull ? 'Tournament Full' : 'Cannot Join'}
                </h3>
                <p className="text-gray-600">
                  {isFull
                    ? 'This tournament has reached maximum capacity.'
                    : 'This tournament is no longer accepting new players.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tournament Rules */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Tournament Rules</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Fair play is mandatory. Any cheating will result in permanent ban.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Report any technical issues immediately to tournament admin.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">All players must join the match at the scheduled time.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Prize distribution based on final rankings and kill counts.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Entry fees are non-refundable except in technical issues.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Follow all game-specific rules and guidelines.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Maintain respect towards all participants and organizers.</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800">Terms & Conditions</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Participation:</strong> By joining this tournament, you agree to abide by all rules and regulations set forth by the tournament organizers.
            </p>
            <p>
              <strong>2. Eligibility:</strong> Participants must be 18 years or older. Minors may participate with parental consent.
            </p>
            <p>
              <strong>3. Entry Fees:</strong> Entry fees are non-refundable under any circumstances except technical issues caused by the platform.
            </p>
            <p>
              <strong>4. Fair Play:</strong> Any form of cheating, hacking, or unfair advantage will result in immediate disqualification and permanent ban.
            </p>
            <p>
              <strong>5. Prize Distribution:</strong> Prizes will be distributed within 24-48 hours after tournament completion through the platform.
            </p>
            <p>
              <strong>6. Technical Issues:</strong> In case of technical difficulties, participants must report immediately. Decisions by organizers are final.
            </p>
            <p>
              <strong>7. Code of Conduct:</strong> Maintain respectful behavior towards all participants, organizers, and spectators.
            </p>
            <p>
              <strong>8. Data Privacy:</strong> Personal information collected will be used solely for tournament purposes and will not be shared with third parties.
            </p>
            <p>
              <strong>9. Tournament Cancellation:</strong> Organizers reserve the right to cancel tournaments due to insufficient participation or technical issues.
            </p>
            <p>
              <strong>10. Governing Law:</strong> All disputes will be resolved under the jurisdiction of local courts.
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <Link
          to="/home"
          className="block w-full text-center bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>

      {/* Slot Selection Modal */}
      {showSlotSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Your Slot</h3>
              <button
                onClick={() => {
                  setShowSlotSelection(false);
                  setSelectedSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose your slot number for this team-based tournament. Available slots are shown in green.
              </p>

              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                {tournament.slots && tournament.slots.map((slot, index) => {
                  const isOccupied = slot.userId;
                  const isSelected = selectedSlot === slot.slotNumber;

                  return (
                    <button
                      key={slot.slotNumber}
                      onClick={() => !isOccupied && setSelectedSlot(slot.slotNumber)}
                      disabled={isOccupied}
                      className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${
                        isOccupied
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-lg font-bold">{slot.slotNumber}</div>
                      <div className="text-xs mt-1">
                        {isOccupied ? 'Taken' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSlotSelection(false);
                  setSelectedSlot(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedSlot && handleJoinTournament(selectedSlot)}
                disabled={!selectedSlot || joining}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {joining ? 'Joining...' : `Book Slot ${selectedSlot || ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;