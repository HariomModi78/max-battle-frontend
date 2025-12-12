import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Bell,
  BellRing,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  Gift,
  Wallet,
  Clock
} from 'lucide-react';

const NotificationPage = () => {
  const { userId } = useParams();
  const { user, notifications, markNotificationAsRead, deleteNotifications } = useAuth();
  const [loading, setLoading] = useState(false);

  const getNotificationIcon = (title) => {
    if (title.toLowerCase().includes('welcome') || title.toLowerCase().includes('join')) {
      return <Gift className="h-5 w-5 text-green-600" />;
    } else if (title.toLowerCase().includes('withdraw') || title.toLowerCase().includes('wallet')) {
      return <Wallet className="h-5 w-5 text-blue-600" />;
    } else if (title.toLowerCase().includes('tournament') || title.toLowerCase().includes('win')) {
      return <Trophy className="h-5 w-5 text-yellow-600" />;
    } else if (title.toLowerCase().includes('alert') || title.toLowerCase().includes('update')) {
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    } else {
      return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDeleteRead = async () => {
    setLoading(true);
    try {
      await deleteNotifications();
      toast.success('Read notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(notif => !notif.seen).length;
  const readNotifications = notifications.filter(notif => notif.seen);
  const unreadNotifications = notifications.filter(notif => !notif.seen);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-blue-100">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          {readNotifications.length > 0 && (
            <button
              onClick={handleDeleteRead}
              disabled={loading}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Clear Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BellRing className="h-5 w-5 mr-2 text-blue-600" />
              New Notifications ({unreadNotifications.length})
            </h2>
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-800 p-1"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Earlier Notifications
            </h2>
            <div className="space-y-3">
              {readNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 opacity-60">
                      {getNotificationIcon(notification.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-700 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">You'll receive notifications about tournaments, winnings, and updates here.</p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Tournament Updates</div>
                <div className="text-sm text-gray-600">Get notified about new tournaments and matches</div>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Winning Alerts</div>
                <div className="text-sm text-gray-600">Instant notifications for tournament wins</div>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Promotional Offers</div>
                <div className="text-sm text-gray-600">Special offers and bonus opportunities</div>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
