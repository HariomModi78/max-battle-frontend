import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Plus, Minus, History, Shield } from 'lucide-react';

const Wallet = () => {
  // No need for userId from params - user data comes from auth context
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-5 w-5 text-green-600" />;
      case 'withdraw':
        return <Minus className="h-5 w-5 text-red-600" />;
      case 'winning':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'bonus':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <History className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'winning':
      case 'bonus':
        return 'text-green-600';
      case 'withdraw':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 md:p-8 lg:p-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <WalletIcon className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12" />
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">My Wallet</h1>
              <p className="text-white/80 text-sm md:text-base lg:text-lg mt-1">Manage your gaming funds</p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm md:text-base lg:text-lg opacity-90 mb-1">Total Balance</div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{formatCurrency(user.totalBalance || 0)}</div>
              </div>
              <div className="text-6xl md:text-7xl lg:text-8xl opacity-20">💰</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm md:text-base lg:text-lg opacity-90 mb-1">Available for Play</div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">{formatCurrency((user.totalBalance || 0) - (user.winning || 0))}</div>
              </div>
              <div className="text-6xl md:text-7xl lg:text-8xl opacity-20">🎮</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/deposit"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-6 w-6 mx-auto mb-2" />
            Add Money
          </Link>
          <Link
            to="/withdraw"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl text-center font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Minus className="h-6 w-6 mx-auto mb-2" />
            Withdraw
          </Link>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Balance Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Winnings</div>
                <div className="text-sm text-gray-600">From tournaments</div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(user.winning || 0)}
            </div>
          </div>

          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Bonus</div>
                <div className="text-sm text-gray-600">Referral & joining bonus</div>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(user.bonus || 0)}
            </div>
          </div>

          <div className="flex justify-between items-center bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <WalletIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Deposited</div>
                <div className="text-sm text-gray-600">Added money</div>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(user.deposited || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.status)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {transaction.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getTransactionColor(transaction.status)}`}>
                    {transaction.status === 'withdraw' ? '-' : '+'}
                    {formatCurrency(transaction.amount || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500">Your transaction history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
