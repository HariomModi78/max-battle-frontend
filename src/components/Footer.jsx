import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import homeIcon from '../assets/images/home.webp';
import walletIcon from '../assets/images/wallet.webp';
import notificationIcon from '../assets/images/notification.webp';
import leaderboardIcon from '../assets/images/leadboard.webp';
import profileIcon from '../assets/images/profile.webp';

const Footer = () => {
  const { user, notifications } = useAuth();

  if (!user) {
    return null; // Don't show footer if not logged in
  }

  const unreadNotifications = notifications.filter(notif => !notif.seen).length;

  return (
    <>
      {/* Fake footer for spacing */}
      <div className="h-20"></div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          <Link
            to={`/home/${user._id}`}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <img loading="lazy" src={homeIcon} alt="Home" className="w-6 h-6 mb-1" />
            <p className="text-xs font-medium text-secondary-700">Home</p>
          </Link>

          <Link
            to={`/wallet/${user._id}`}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <img loading="lazy" src={walletIcon} alt="Wallet" className="w-6 h-6 mb-1" />
            <p className="text-xs font-medium text-secondary-700">Wallet</p>
          </Link>

          <Link
            to={`/notification/${user._id}`}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-secondary-50 transition-colors relative"
          >
            <div className="relative">
              <img loading="lazy" src={notificationIcon} alt="Inbox" className="w-6 h-6 mb-1" />
              {unreadNotifications > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-secondary-700">Inbox</p>
          </Link>

          <Link
            to={`/leaderboard/${user._id}`}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <img loading="lazy" src={leaderboardIcon} alt="Leaderboard" className="w-6 h-6 mb-1" />
            <p className="text-xs font-medium text-secondary-700">Leaderboard</p>
          </Link>

          <Link
            to={`/profile/${user._id}`}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <img loading="lazy" src={profileIcon} alt="Profile" className="w-6 h-6 mb-1" />
            <p className="text-xs font-medium text-secondary-700">Profile</p>
          </Link>
        </div>
      </footer>
    </>
  );
};

export default Footer;
