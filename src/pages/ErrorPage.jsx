import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, MessageCircle } from 'lucide-react';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">Something went wrong</p>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. Don't worry, let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Go to Home</span>
              </button>

              <button
                onClick={handleRefresh}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm mb-4">
              If you keep seeing this error, please contact our support team.
            </p>
            <a
              href="https://wa.me/7898488935"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>

        {/* Error Code */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Error 404 - Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;