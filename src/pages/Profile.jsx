import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Gamepad2, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gameName: user?.gameName || '',
    gameId: user?.gameId || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/changeDetail/${userId}`, formData, { withCredentials: true });
      updateUser({ ...user, ...formData });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      gameName: user?.gameName || '',
      gameId: user?.gameId || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-600">Player Profile</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{user.username}</span>
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>
          </div>

          {/* Game Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Fire Max ID Name
            </label>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <div className="flex-1 flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="gameName"
                    value={formData.gameName}
                    onChange={handleChange}
                    className="flex-1 border-none outline-none bg-transparent"
                    placeholder="Enter your game name"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user.gameName || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Game ID (if applicable) */}
          {user.gameId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game ID
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{user.gameId}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.totalBalance || 0}</div>
              <div className="text-sm text-gray-600">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.totalKill || 0}</div>
              <div className="text-sm text-gray-600">Total Kills</div>
            </div>
          </div>

          {/* Referral Info */}
          {user.referrals !== undefined && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.referrals || 0}</div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{user.earning || 0}</div>
                  <div className="text-sm text-gray-600">Referral Earnings</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/referAndEarn/${userId}`)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
          >
            Refer & Earn
          </button>
          <button
            onClick={() => navigate(`/wallet/${userId}`)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
