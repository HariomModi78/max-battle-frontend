import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/status');
      if (response.data.user) {
        setUser(response.data.user);
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Transform frontend data to match backend expectations
      const backendData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        gameName: userData.gameName,
        isEighteenPlus: userData.age,
        referralCode: userData.referralCode
      };

      const response = await api.post('/auth/register', backendData);
      return {
        success: true,
        message: response.data.message,
        email: response.data.email,
        expiresIn: response.data.expiresIn
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return {
        success: true,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setNotifications([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, seen: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotifications = async () => {
    try {
      await api.post('/notifications/delete-read');
      setNotifications(prev => prev.filter(notif => !notif.seen));
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const value = {
    user,
    loading,
    notifications,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateUser,
    markNotificationAsRead,
    deleteNotifications,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
