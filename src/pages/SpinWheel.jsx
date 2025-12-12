import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { RotateCcw, Clock, Sparkles, Gift, Zap, Trophy, Star, Coins, Target, Flame, Diamond } from 'lucide-react';

const SpinWheel = () => {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { amount: 5, color: 'from-yellow-400 to-orange-500', icon: Trophy, label: '₹5 Jackpot', probability: 8, rarity: 'legendary' },
    { amount: 2, color: 'from-purple-500 to-pink-500', icon: Diamond, label: '₹2 Diamond', probability: 12, rarity: 'epic' },
    { amount: 1, color: 'from-blue-500 to-cyan-500', icon: Star, label: '₹1 Star', probability: 20, rarity: 'rare' },
    { amount: 0.5, color: 'from-green-500 to-emerald-500', icon: Coins, label: '₹0.5 Coins', probability: 25, rarity: 'uncommon' },
    { amount: 0.2, color: 'from-indigo-500 to-purple-500', icon: Target, label: '₹0.2 Target', probability: 20, rarity: 'common' },
    { amount: 0, color: 'from-gray-500 to-slate-600', icon: Flame, label: 'Try Again', probability: 15, rarity: 'common' }
  ];

  useEffect(() => {
    checkSpinAvailability();
  }, []);

  const checkSpinAvailability = () => {
    if (user?.lastSpinTime) {
      const lastSpin = new Date(user.lastSpinTime);
      const now = new Date();
      const hoursSinceLastSpin = (now - lastSpin) / (1000 * 60 * 60);

      if (hoursSinceLastSpin < 5) {
        const remaining = (5 - hoursSinceLastSpin).toFixed(2);
        const remainingMs = remaining * 60 * 60 * 1000;
        setTimeLeft(remainingMs);
        setCanSpin(false);

        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1000) {
              setCanSpin(true);
              clearInterval(timer);
              return null;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
    setCanSpin(true);
  };

  const formatTime = (ms) => {
    if (!ms) return '00:00:00';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    try {
      // Call the real spin API
      const response = await api.post('/transactions/spin');

      if (!response.data.success) {
        toast.error(response.data.message || 'Failed to spin the wheel');
        setIsSpinning(false);

        // Update spin availability if it's a cooldown issue
        if (response.data.canSpin === false) {
          setCanSpin(false);
          setTimeLeft(response.data.nextSpinIn * 60 * 60 * 1000); // Convert hours to ms
          checkSpinAvailability();
        }
        return;
      }

      const { result, user: updatedUser } = response.data;
      const prize = prizes[result.prizeIndex];

      // Calculate rotation (each segment is 60 degrees, add multiple rotations)
      const baseRotation = result.prizeIndex * 60;
      const extraRotations = 5 + Math.random() * 5; // 5-10 extra rotations
      const finalRotation = rotation + (extraRotations * 360) + (30 - baseRotation); // Center on segment

      setRotation(finalRotation);

      // Update user data immediately
      updateUser({
        ...user,
        totalBalance: updatedUser.totalBalance,
        bonus: updatedUser.bonus,
        lastSpinTime: updatedUser.lastSpinTime
      });

      // Show result after animation
      setTimeout(() => {
        setResult({
          amount: result.amount,
          color: prize.color,
          index: result.prizeIndex
        });

        // Show toast message
        if (result.amount > 0) {
          toast.success(`Congratulations! You won ₹${result.amount}!`);
        } else {
          toast.success('Better luck next time!');
        }

        setIsSpinning(false);
        setCanSpin(false);
        checkSpinAvailability();
      }, 4000);

    } catch (error) {
      console.error('Spin error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to spin the wheel';
      toast.error(errorMessage);
      setIsSpinning(false);

      // If it's a cooldown error, update the timer
      if (error.response?.data?.canSpin === false) {
        setCanSpin(false);
        setTimeLeft((error.response.data.nextSpinIn || 5) * 60 * 60 * 1000);
        checkSpinAvailability();
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-20 animate-pulse"></div>
        <div className="relative text-white p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl animate-bounce">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Lucky Spin Wheel
          </h1>
          <p className="text-purple-200 text-lg">Spin to win amazing prizes every 5 hours!</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 max-w-4xl mx-auto">

        {/* Spin Wheel */}
        <div className="flex justify-center mb-8">
          <div className="relative">

            {/* Outer Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-30 blur-xl animate-pulse scale-110"></div>

            {/* Wheel Container */}
            <div className="relative w-96 h-96">

              {/* Wheel Background with Segments */}
              <div
                className={`w-full h-full rounded-full shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.23, 1, 0.32, 1) ${
                  isSpinning ? '' : ''
                }`}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(
                    from 0deg,
                    #fbbf24 0deg 60deg,
                    #3b82f6 60deg 120deg,
                    #8b5cf6 120deg 180deg,
                    #ec4899 180deg 240deg,
                    #10b981 240deg 300deg,
                    #f59e0b 300deg 360deg
                  )`
                }}
              >

                {/* Inner Shadow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>

                {/* Prize Segments */}
                {prizes.map((prize, index) => {
                  const Icon = prize.icon;
                  const angle = index * 60;
                  const textRadius = 120;
                  const iconRadius = 80;

                  return (
                    <div key={index} className="absolute inset-0">
                      {/* Text Label */}
                      <div
                        className="absolute text-white font-bold text-sm flex items-center justify-center"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle + 30}deg) translateY(-${textRadius}px)`,
                          transformOrigin: 'center',
                          width: '60px',
                          textAlign: 'center'
                        }}
                      >
                        <div className="bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                          {prize.label}
                        </div>
                      </div>

                      {/* Icon */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle + 30}deg) translateY(-${iconRadius}px)`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${prize.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Segment Divider */}
                      <div
                        className="absolute w-1 bg-white/80 shadow-lg"
                      style={{
                        top: '50%',
                        left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                          transformOrigin: '50% 160px',
                          height: '20px'
                      }}
                    />
                    </div>
                  );
                })}

                {/* Center Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-1">SPIN</div>
                      <div className="text-xs text-gray-600">TO WIN</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Spin Button */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={spinWheel}
                disabled={!canSpin || isSpinning}
                  className={`relative w-24 h-24 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  canSpin && !isSpinning
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/50'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                  {/* Button Glow */}
                  {canSpin && !isSpinning && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-pink-500 animate-ping opacity-30"></div>
                  )}

                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <RotateCcw className={`h-10 w-10 text-white transition-transform duration-300 ${
                      isSpinning ? 'animate-spin' : 'group-hover:rotate-12'
                }`} />
                  </div>

                  {/* Spin Text */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm whitespace-nowrap">
                    {isSpinning ? 'SPINNING...' : canSpin ? 'TAP TO SPIN' : 'WAIT'}
                  </div>
              </button>
            </div>

            {/* Pointer */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative">
                  <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Spinning Effects */}
              {isSpinning && (
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping opacity-50"></div>
              )}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="text-center mb-8 animate-bounce">
            <div className="relative inline-block">
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${prizes[result.index].color} rounded-full blur-lg opacity-50 animate-pulse`}></div>

              <div className={`relative inline-flex items-center space-x-3 px-8 py-4 rounded-full text-white font-bold text-xl shadow-2xl bg-gradient-to-r ${prizes[result.index].color} transform hover:scale-105 transition-all duration-300`}>
                <div className="flex items-center space-x-2">
                  {React.createElement(prizes[result.index].icon, { className: "h-6 w-6 animate-spin" })}
                  <span className="text-2xl">
                {result.amount > 0
                      ? `₹${result.amount}!`
                      : 'Try Again!'
                }
              </span>
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              {/* Confetti Effect for Wins */}
              {result.amount > 0 && (
                <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
                  <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-2 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute bottom-0 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute top-3 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                </div>
              )}
            </div>

            <div className="mt-4 text-white text-lg font-medium">
              {result.amount > 0
                ? '🎉 Congratulations! 🎉'
                : '😊 Better luck next time! 😊'
              }
            </div>
          </div>
        )}

        {/* Time Remaining */}
        {!canSpin && timeLeft && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl border-2 border-orange-300 mb-6 shadow-2xl animate-pulse">
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <Clock className="h-8 w-8 text-white animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg mb-1">Next Spin Available In</div>
                <div className="text-3xl font-bold text-yellow-300 font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-orange-200 text-sm mt-1">Come back soon for more prizes!</div>
              </div>
            </div>
          </div>
        )}

        {/* Prize Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <h3 className="font-bold text-white mb-6 text-center text-xl flex items-center justify-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
            Prize Pool
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prizes.map((prize, index) => {
              const Icon = prize.icon;
              const rarityColors = {
                legendary: 'ring-yellow-400 shadow-yellow-400/50',
                epic: 'ring-purple-400 shadow-purple-400/50',
                rare: 'ring-blue-400 shadow-blue-400/50',
                uncommon: 'ring-green-400 shadow-green-400/50',
                common: 'ring-gray-400 shadow-gray-400/50'
              };

              return (
                <div key={index} className={`relative p-4 bg-gradient-to-br ${prize.color} rounded-xl shadow-lg ring-2 ${rarityColors[prize.rarity]} transform hover:scale-105 transition-all duration-300`}>
                  {/* Rarity Badge */}
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded-full capitalize">
                    {prize.rarity}
                  </div>

                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 backdrop-blur-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="text-white font-bold text-lg mb-1">
                      {prize.label}
                    </div>

                    <div className="text-white/80 text-sm">
                      {prize.probability}% chance
                </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-2xl border border-white/20">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-400" />
              How to Play
          </h3>
            <ul className="text-white/90 space-y-3">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Spin once every 5 hours for free</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Win bonus coins instantly credited</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Higher rarity prizes have lower chances</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>No purchase necessary - completely free!</span>
              </li>
          </ul>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-2xl shadow-2xl border border-white/20">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-400" />
              Your Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Total Balance</span>
                <span className="font-bold text-white">₹{user?.totalBalance || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Bonus Won</span>
                <span className="font-bold text-yellow-300">₹{user?.bonus || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Next Spin</span>
                <span className="font-bold text-white">
                  {canSpin ? 'Available Now!' : formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Spin Status</span>
                <span className={`font-bold ${canSpin ? 'text-green-300' : 'text-orange-300'}`}>
                  {canSpin ? 'Ready' : 'Cooldown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;