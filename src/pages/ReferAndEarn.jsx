import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Share2,
  Copy,
  Users,
  Gift,
  TrendingUp,
  MessageCircle,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Crown,
  Star
} from 'lucide-react';

const ReferAndEarn = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalBonusEarned: 0,
    activeReferrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    console.log('ReferAndEarn useEffect triggered');
    console.log('User object:', user);
    console.log('User authenticated:', !!user);

    if (user && user._id) {
      console.log('User is authenticated, fetching referrals...');
      fetchReferrals();

      // Use the actual referral code from database, or generate one if not exists
      if (user.referralCode) {
        setReferralCode(user.referralCode);
      } else {
        // If no referral code exists, show a message to refresh or something
        setReferralCode('Loading...');
        // The referral code should be generated during registration
        console.log('No referral code found for user:', user._id);
      }
    } else {
      console.log('User not authenticated, skipping API call');
      setLoading(false);
    }
  }, [user]);

  const fetchReferrals = async () => {
    try {
      console.log('Fetching referral stats...');
      const response = await api.get('/users/referral-stats');
      console.log('Referral stats response:', response.data);

      if (response.data.success) {
        console.log('Setting referral stats:', {
          totalReferrals: response.data.stats?.totalReferrals || 0,
          totalBonusEarned: response.data.stats?.totalBonusEarned || 0,
          activeReferrals: response.data.stats?.activeReferrals || 0
        });

        setReferrals(response.data.referredUsers || []);
        setReferralStats({
          totalReferrals: response.data.stats?.totalReferrals || 0,
          totalBonusEarned: response.data.stats?.totalBonusEarned || 0,
          activeReferrals: response.data.stats?.activeReferrals || 0
        });
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      console.error('Error details:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        toast.error('Please login to view referral stats');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load referral data');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareOnWhatsApp = () => {
    const message = `🎮 Join Max Battle - The Ultimate Gaming Tournament Platform!\n\nUse my referral code: ${referralCode}\n\nGet ₹5 bonus on signup!\n\nDownload now: ${window.location.origin}/register?ref=${referralCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}/register?ref=${referralCode}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `🎮 Join Max Battle gaming tournaments! Use code ${referralCode} for ₹5 bonus!`;
    const url = `${window.location.origin}/register?ref=${referralCode}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalEarnings = referralStats.totalBonusEarned || 0;
  const totalReferrals = referralStats.totalReferrals || 0;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Refer & Earn</h1>
          <p className="text-purple-100">Invite friends and earn rewards!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <div className="text-sm opacity-90">Total Referrals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <div className="text-sm opacity-90">Total Earnings</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Referral Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-blue-600" />
            Your Referral Code
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{referralCode}</div>
              <p className="text-sm text-gray-600">Share this code with your friends</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={copyReferralLink}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-5 w-5" />
              <span>Copy Referral Link</span>
            </button>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center justify-center space-x-1 bg-green-600 text-white py-3 px-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={shareOnFacebook}
                className="flex items-center justify-center space-x-1 bg-blue-600 text-white py-3 px-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </button>
              <button
                onClick={shareOnTwitter}
                className="flex items-center justify-center space-x-1 bg-sky-500 text-white py-3 px-2 rounded-lg font-medium hover:bg-sky-600 transition-colors text-sm"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </button>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">How Refer & Earn Works</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Share Your Code</div>
                <div className="text-sm text-gray-600">Send your referral code to friends and family</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Friend Signs Up</div>
                <div className="text-sm text-gray-600">Your friend registers using your referral code</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Earn Rewards</div>
                <div className="text-sm text-gray-600">Both you and your friend get ₹5 bonus instantly</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Your Referrals ({referrals.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={referral._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{referral.username}</div>
                      <div className="text-sm text-gray-600">
                        Joined {new Date(referral.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+₹{referral.bonusEarned || 5}</div>
                    <div className="text-xs text-green-700">Earned</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-600 mb-4">Share your referral code to start earning rewards</p>
              <button
                onClick={copyReferralLink}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Share Referral Code
              </button>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-start space-x-3">
            <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-900">Terms & Conditions</div>
              <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                <li>• Referral bonus is credited instantly after signup</li>
                <li>• Multiple referrals from same device/IP may be invalid</li>
                <li>• Max Battle reserves the right to modify terms</li>
                <li>• Earnings can be used for tournament entry fees</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;