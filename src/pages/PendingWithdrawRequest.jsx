import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  X,
  Clock,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  AlertTriangle,
  Search
} from 'lucide-react';

const PendingWithdrawRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId } = useParams();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      const params = { status: filterStatus };
      const response = await api.get('/transactions', { params });

      if (response.data.success) {
        const withdrawalTransactions = response.data.transactions.filter(
          transaction => transaction.type === 'withdrawal'
        );
        setWithdrawals(withdrawalTransactions);
      }
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async (transactionId, action) => {
    setProcessingId(transactionId);

    try {
      let endpoint, status, successMessage;

      if (action === 'approve') {
        endpoint = `/admin/withdrawals/${transactionId}/approve`;
        status = 'completed';
        successMessage = 'Withdrawal approved successfully';
      } else {
        endpoint = `/admin/withdrawals/${transactionId}/reject`;
        status = 'failed';
        successMessage = 'Withdrawal rejected successfully';
      }

      const response = await api.put(endpoint);

      if (response.data.success) {
        // Update local state
        setWithdrawals(withdrawals.map(withdrawal =>
          withdrawal._id === transactionId
            ? { ...withdrawal, status }
            : withdrawal
        ));

        toast.success(successMessage);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Process withdrawal error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="h-5 w-5 text-purple-500" />;
      case 'bank_transfer':
        return <Banknote className="h-5 w-5 text-blue-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const userMatch = withdrawal.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     withdrawal.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return userMatch;
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/adminPanel/${adminId}`)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <DollarSign className="h-7 w-7 mr-3" />
              Withdrawal Requests
            </h1>
            <p className="text-red-100 mt-1">Process pending withdrawal requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{withdrawals.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {withdrawals.filter(w => w.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {withdrawals.filter(w => w.status === 'failed').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading withdrawal requests...</p>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {withdrawal.userId?.username || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600">{withdrawal.userId?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested on {new Date(withdrawal.createdAt).toLocaleDateString()} at{' '}
                        {new Date(withdrawal.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {withdrawal.status === 'pending' ? 'Pending' :
                     withdrawal.status === 'completed' ? 'Approved' : 'Rejected'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getPaymentMethodIcon(withdrawal.paymentMethod)}
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {withdrawal.paymentMethod?.replace('_', ' ') || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {withdrawal.metadata?.accountDetails && (
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Account Details</p>
                        <p className="text-sm font-medium text-gray-900">
                          {withdrawal.metadata.accountDetails}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {withdrawal.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => processWithdrawal(withdrawal._id, 'approve')}
                      disabled={processingId === withdrawal._id}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {processingId === withdrawal._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>

                    <button
                      onClick={() => processWithdrawal(withdrawal._id, 'reject')}
                      disabled={processingId === withdrawal._id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {processingId === withdrawal._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                {withdrawal.status !== 'pending' && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Processed on {new Date(withdrawal.processedAt || withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {filteredWithdrawals.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filterStatus === 'pending'
                ? 'No pending withdrawal requests'
                : 'No withdrawal requests found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingWithdrawRequest;