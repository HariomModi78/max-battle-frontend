import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import logo from '../assets/images/logo.webp';

const Header = ({ isDesktop = false, onMenuClick, showMenuIcon = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Don't show header if not logged in
  }

  if (isDesktop) {
    // Desktop Header - Simplified, menu button for sidebar
    return (
      <header className="h-16 bg-white border-b border-secondary-200 shadow-lg">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-secondary-600" />
            </button>
            <h1 className="text-xl font-bold text-secondary-900">Max Battle</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Link
              to="/wallet"
              className="flex items-center space-x-2 bg-gradient-to-r from-accent-yellow to-yellow-500 px-4 py-2 rounded-full hover:scale-105 transition-all"
              style={{boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'}}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/128/9382/9382295.png"
                alt="Coin"
                className="h-5 w-5"
              />
              <span className="text-sm font-bold text-yellow-900">
                ₹{user.totalBalance?.toLocaleString("en-IN") || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Mobile Header - With optional menu icon
  return (
    <header className="h-14 w-full max-w-sm bg-white border-b border-secondary-200 sticky top-0 z-50" style={{boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'}}>
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center space-x-3">
          {/* Menu Icon for mobile sidebar */}
          {showMenuIcon && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-secondary-600" />
            </button>
          )}

          {/* Logo */}
          <Link to={`/home/${user._id}`} className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Max Battle"
              className="h-6 w-6"
              loading="lazy"
            />
            <div className="flex flex-col">
              <span className="text-xs text-secondary-600 leading-tight">Welcome Back,</span>
              <span className="text-sm font-bold text-secondary-900 leading-tight">Max Battle</span>
            </div>
          </Link>
        </div>

        {/* Wallet Amount */}
        <Link
          to={`/wallet/${user._id}`}
          className="flex items-center space-x-1 bg-gradient-to-r from-accent-yellow to-yellow-500 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105" style={{boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'}}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/128/9382/9382295.png"
            alt="Coin"
            className="h-4 w-4"
          />
          <span className="text-sm font-bold text-yellow-900">
            {user.totalBalance?.toLocaleString("en-IN") || 0}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
