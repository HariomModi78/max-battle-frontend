import React from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  User,
  Wallet,
  Trophy,
  Bell,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  Users,
  FileText,
  Shield
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?._id;


  const navigationItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      current: location.pathname === '/home',
    },
    {
      name: 'Tournaments',
      href: '/my-tournaments',
      icon: Trophy,
      current: location.pathname.includes('/my-tournaments') || location.pathname.includes('/tournament'),
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Wallet,
      current: location.pathname === '/wallet',
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: Target,
      current: location.pathname === '/leaderboard',
    },
    {
      name: 'Refer & Earn',
      href: '/referAndEarn',
      icon: Users,
      current: location.pathname === '/referAndEarn',
    },
    {
      name: 'Spin Wheel',
      href: '/spin',
      icon: Gift,
      current: location.pathname === '/spin',
    },
    {
      name: 'Notifications',
      href: '/notification',
      icon: Bell,
      current: location.pathname === '/notification',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: location.pathname === '/profile',
    },
    // Admin Panel - only show for admin users
    ...(user?.role === 'admin' ? [{
      name: 'Admin Panel',
      href: `/adminPanel/${user._id}`,
      icon: Shield,
      current: location.pathname.startsWith('/admin'),
    }] : []),
  ];

  const staticPages = [
    {
      name: 'FAQ',
      href: '/faq',
      icon: FileText,
      current: location.pathname === '/faq',
    },
    {
      name: 'Privacy Policy',
      href: '/privacyPolicy',
      icon: FileText,
      current: location.pathname === '/privacyPolicy',
    },
    {
      name: 'Terms & Conditions',
      href: '/termsAndCondition',
      icon: FileText,
      current: location.pathname === '/termsAndCondition',
    },
  ];

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMobile
          ? (isOpen ? 'translate-x-0' : '-translate-x-full')
          : `lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-secondary-200 bg-gradient-to-r from-primary-500 to-primary-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">MB</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Max Battle</h1>
                <p className="text-primary-100 text-sm">Gaming Tournaments</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`${isMobile ? '' : 'lg:hidden'} p-2 rounded-lg text-white hover:bg-white/10 transition-colors`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Navigation
              </h3>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsOpen(false);
                    }}
                    className={`
                      group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-left
                      ${item.current
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors
                        ${item.current ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-600'}
                      `}
                    />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Static Pages */}
            <div className="pt-6 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Support
              </h3>
              {staticPages.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsOpen(false);
                    }}
                    className={`
                      group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-left
                      ${item.current
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors
                        ${item.current ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-600'}
                      `}
                    />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          {user && (
            <div className="border-t border-secondary-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-secondary-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-600">Balance</span>
                    <span className="font-semibold text-secondary-900">
                      ₹{user.totalBalance?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>

                <button
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  onClick={async () => {
                    await logout();
                    setIsOpen(false);
                    navigate('/login');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
