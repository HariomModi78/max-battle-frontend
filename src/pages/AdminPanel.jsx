import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Trophy,
  Wallet,
  Mail,
  DollarSign,
  TrendingUp,
  Shield,
  ArrowLeft
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/home');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const adminOptions = [
    {
      title: 'Create Tournament',
      description: 'Create new gaming tournaments',
      icon: Trophy,
      href: `/adminCreateTournament/${user._id}`,
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Tournaments',
      description: 'View and edit existing tournaments',
      icon: Trophy,
      href: `/admin/tournament/all/${user._id}`,
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'View all registered users',
      icon: Users,
      href: `/adminTotalUser/${user._id}`,
      color: 'bg-purple-500'
    },
    {
      title: 'Prize Distribution',
      description: 'Distribute prizes to tournament winners',
      icon: DollarSign,
      href: `/adminPrizeDistribute/${user._id}/all`,
      color: 'bg-yellow-500'
    },
    {
      title: 'Withdrawal Requests',
      description: 'Process pending withdrawal requests',
      icon: Wallet,
      href: `/pendingWithdrawRequest/${user._id}`,
      color: 'bg-red-500'
    },
    {
      title: 'Send Emails',
      description: 'Send emails to users',
      icon: Mail,
      href: `/adminSendEmail/${user._id}`,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="h-7 w-7 mr-3 text-yellow-400" />
              Admin Panel
            </h1>
            <p className="text-gray-300 mt-1">Manage your gaming platform</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tournaments</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹--</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Link
                key={index}
                to={option.href}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${option.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;