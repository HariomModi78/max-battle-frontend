import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Gamepad2, Mail, Lock, Eye, EyeOff, Check, X, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    gameName: '',
    email: '',
    password: '',
    referralCode: '',
    age: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [referralStatus, setReferralStatus] = useState(null); // null, 'checking', 'valid', 'invalid'
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract referral code from URL parameters
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      const upperRefCode = refCode.toUpperCase().trim();
      setFormData(prev => ({
        ...prev,
        referralCode: upperRefCode
      }));
      // Auto-verify referral code from URL
      validateReferralCode(upperRefCode);
    }
  }, [searchParams]);

  // Function to validate referral code
  const validateReferralCode = async (code) => {
    if (!code) return;

    setReferralStatus('checking');

    try {
      const response = await api.get('/users/referralCodes');
      const codes = response.data;
      const normalizedCodes = codes.map(c => c.toUpperCase().trim());

      if (normalizedCodes.includes(code.toUpperCase().trim())) {
        setReferralStatus('valid');
        toast.success('Referral code verified!');
      } else {
        setReferralStatus('invalid');
        toast.error('Invalid referral code');
      }
    } catch (error) {
      console.error('Error checking referral code:', error);
      setReferralStatus('invalid');

      // Handle rate limiting
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error('Failed to verify referral code');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Reset referral status when referral code changes
    if (name === 'referralCode') {
      setReferralStatus(null);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const checkReferralCode = async () => {
    if (!formData.referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    await validateReferralCode(formData.referralCode.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid Gmail address');
      return;
    }

    // Age confirmation
    if (!formData.age) {
      toast.error('Please accept the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        toast.success(result.message || 'Please check your email for verification code.');
        navigate('/register-otp', { state: { email: formData.email } });
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-4">
            <span className="text-white text-xl md:text-2xl font-bold">MB</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">Create Account</h1>
          <p className="text-secondary-600 text-sm md:text-base">Join Max Battle and start winning</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8" style={{boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Game Name Field */}
            <div>
              <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-2">
                Free Fire Max ID Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Gamepad2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="gameName"
                  name="gameName"
                  value={formData.gameName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your game name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your Gmail address"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Only Gmail addresses are accepted</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code Field */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter referral code"
                  />
                  {referralStatus && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {referralStatus === 'checking' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      {referralStatus === 'valid' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {referralStatus === 'invalid' && (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* Only show verify button if code is not already verified */}
                {referralStatus !== 'valid' && (
                <button
                  type="button"
                  onClick={checkReferralCode}
                  disabled={!formData.referralCode.trim() || referralStatus === 'checking'}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  {referralStatus === 'checking' ? 'Checking...' :
                     referralStatus === 'invalid' ? 'Try Again' : 'Verify'}
                </button>
                )}
                {/* Show verified status when code is valid */}
                {referralStatus === 'valid' && (
                  <div className="flex items-center px-4 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                    <Check className="h-4 w-4 mr-2" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="age"
                name="age"
                checked={formData.age}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="age" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link
                  to="/termsAndCondition"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  target="_blank"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Max Battle. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
