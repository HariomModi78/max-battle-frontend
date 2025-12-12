import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Play, Clock, CheckCircle, Trophy, Zap, Users, Swords } from 'lucide-react';

// Import images
import joiningBonus from '../assets/images/joiningBonus.webp';
import banner1 from '../assets/images/banner1.webp';
import banner2 from '../assets/images/banner2.webp';
import banner3 from '../assets/images/banner3.webp';
import banner4 from '../assets/images/banner4.webp';
import banner5 from '../assets/images/banner5.webp';
import banner6 from '../assets/images/banner6.webp';
import ongoing from '../assets/images/ongoing.webp';
import upcoming from '../assets/images/upcoming.webp';
import completed from '../assets/images/completed.webp';
import freeMatch from '../assets/images/freeMatch.webp';
import rsMatch from '../assets/images/1rsMatch.webp';
import solo from '../assets/images/solo.webp';
import v1 from '../assets/images/1v1.webp';
import v2 from '../assets/images/2v2.webp';
import v4 from '../assets/images/4v4.webp';

const Home = () => {
  // No need for userId anymore - user data comes from auth context
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState({});
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [luckyDraw, setLuckyDraw] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images
  const carouselImages = [banner1, banner4, banner3, banner5, banner6, banner2];

  useEffect(() => {
    if (user) {
      fetchHomeData();
    }
  }, [user]);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const fetchHomeData = async () => {
    try {
      // Fetch tournament statistics from backend
      const response = await api.get('/tournaments/stats');

      if (response.data.success) {
        const stats = response.data.stats || {};
        const upcomingTournaments = response.data.upcomingTournaments || [];

        // Set tournament counts directly from backend stats
        setTournaments({
          free: Array(stats.free || 0).fill({}), // Create array with length equal to count
          oneRs: Array(stats.oneRs || 0).fill({}),
          perKill: Array(stats.perKill || 0).fill({}),
          csSolo: Array(stats.csSolo || 0).fill({}),
          csDuo: Array(stats.csDuo || 0).fill({}),
          csSquad: Array(stats.csSquad || 0).fill({})
        });

        // Also set upcoming tournaments for display
        setUpcomingTournaments(upcomingTournaments);
      }

      setLuckyDraw(null); // Will implement lucky draw later
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load home data');
    } finally {
      setDataLoading(false);
    }
  };

  const confirmBonus = async () => {
    try {
      // TODO: Implement bonus confirmation in new backend
      updateUser({ ...user, isApplyCode: false });
      toast.success('Bonus confirmed!');
    } catch (error) {
      toast.error('Failed to confirm bonus');
    }
  };

  const handleSpinClick = () => {
    navigate('/spin');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Remove loading check for instant page load

  return (
    <div className="pb-20 bg-secondary-50">
      {/* Joining Bonus Modal */}
      {user?.isApplyCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <img src={joiningBonus} alt="Joining Bonus" className="w-full h-auto" />
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 font-semibold cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
              onClick={confirmBonus}
            >
              Confirm
            </div>
          </div>
        </div>
      )}


      {/* Notice Board Carousel */}
      <div className="relative mx-4 mt-4 mb-6">
        <div className="overflow-hidden rounded-xl shadow-lg h-48 md:h-56">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 min-w-0 h-full">
                <img
                  loading="lazy"
                  className="w-full h-full object-cover"
                  src={image}
                  alt={`Banner ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center mt-3 space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary-500 scale-125'
                  : 'bg-secondary-300 hover:bg-secondary-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* My Matches Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">My Matches</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/my-tournaments?tab=ongoing"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col items-center"
          >
            <img loading="lazy" src={ongoing} alt="Ongoing" className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium text-secondary-700">Ongoing</p>
          </Link>
          <Link
            to="/my-tournaments?tab=completed"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col items-center"
          >
            <img loading="lazy" src={upcoming} alt="Upcoming" className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium text-secondary-700">Upcoming</p>
          </Link>
          <Link
            to="/my-tournaments"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col items-center"
            onClick={() => console.log('Navigating to completed:', '/my-tournaments')}
          >
            <img loading="lazy" src={completed} alt="Completed" className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium text-secondary-700">Completed</p>
          </Link>
        </div>
      </div>

      {/* Esports Games Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Esports Games</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Free Matches */}
          <Link
            to="/tournaments?type=free"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={freeMatch} alt="Free Match" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">FREE</p>
                <p className="text-xs text-secondary-500">All Games</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">Available</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.free?.length || 0}
                </span>
              )}
            </div>
          </Link>

          {/* 1Rs Matches */}
          <Link
            to="/tournaments?entryFee=1"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={rsMatch} alt="1Rs Match" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">₹1</p>
                <p className="text-xs text-secondary-500">Full Map</p>
              </div>

            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">Solo</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.oneRs?.length || 0}
                </span>
              )}
            </div>
          </Link>

          {/* Solo Paid */}
          <Link
            to="/tournaments?type=solo&minEntryFee=1"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={solo} alt="Solo" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">PAID</p>
                <p className="text-xs text-secondary-500">Full Map</p>
              </div>

            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">Solo</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.perKill?.length || 0}
                </span>
              )}
            </div>
          </Link>

          {/* CS 1v1 */}
          <Link
            to="/tournaments?game=clash&type=solo"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={v1} alt="1v1" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">PAID</p>
                <p className="text-xs text-secondary-500">Clash Squad</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">1v1</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.csSolo?.length || 0}
                </span>
              )}
            </div>
          </Link>

          {/* CS 2v2 */}
          <Link
            to="/tournaments?game=clash&type=duo"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={v2} alt="2v2" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">PAID</p>
                <p className="text-xs text-secondary-500">Clash Squad</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">2v2</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.csDuo?.length || 0}
                </span>
              )}
            </div>
          </Link>

          {/* CS 4v4 */}
          <Link
            to="/tournaments?game=clash&type=squad"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <img loading="lazy" src={v4} alt="4v4" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">PAID</p>
                <p className="text-xs text-secondary-500">Clash Squad</p>
              </div>

            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-secondary-600">4v4</span>
              {dataLoading ? (
                <div className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  ...
                </div>
              ) : (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tournaments.csSquad?.length || 0}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Tournaments */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Upcoming Tournaments</h2>
        {dataLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTournaments.length > 0 ? (
              upcomingTournaments.map((tournament) => (
                <Link
                  key={tournament._id}
                  to={`/tournament/detail/${tournament._id}`}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all block"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 text-sm">{tournament.tournamentName}</h3>
                      <p className="text-xs text-secondary-600">{tournament.gameName} • {tournament.modeType}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-secondary-600">
                      {tournament.entryFee === 0 ? 'Free' : `₹${tournament.entryFee}`}
                    </div>
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      ₹{tournament.prizePool}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No upcoming tournaments</h3>
                <p className="text-secondary-600">Check back later for new tournaments!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Spin */}
      <div className="daily-spin" onClick={handleSpinClick}>
        <dotlottie-wc
          src="https://lottie.host/ace11316-8dc7-465b-be51-e2a6f4b6f3e9/S98CeTVYp7.lottie"
          speed="1"
          autoplay
          loop
        ></dotlottie-wc>
      </div>
    </div>
  );
};

export default Home;


