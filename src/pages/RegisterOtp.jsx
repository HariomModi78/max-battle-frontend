import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from register page)
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        toast.success('Account verified successfully!');
        navigate('/home');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const result = await resendOtp(email);
      if (result.success) {
        toast.success('OTP sent successfully!');
        setTimeLeft(600); // Reset timer
        setCanResend(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-secondary-600">
            We've sent a 6-digit code to
          </p>
          <p className="font-medium text-secondary-900">{email}</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verify Account
                </div>
              )}
            </button>
          </form>

          {/* Timer and Resend */}
          <div className="mt-6 text-center">
            {!canResend ? (
              <p className="text-secondary-600 text-sm">
                Resend code in{' '}
                <span className="font-medium text-primary-600">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center mx-auto disabled:opacity-50"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Resend Code
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Back to Register */}
        <div className="text-center mt-6">
          <Link
            to="/register"
            className="inline-flex items-center text-secondary-600 hover:text-secondary-800 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Register
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center mt-4">
          <p className="text-xs text-secondary-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterOtp;
