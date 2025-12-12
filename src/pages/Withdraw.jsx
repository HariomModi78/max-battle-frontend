import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  AlertTriangle,
  CheckCircle,
  Loader,
  Info,
  Wallet,
  Shield
} from 'lucide-react';

const Withdraw = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState(1); // 1: UPI check, 2: amount, 3: confirm

  useEffect(() => {
    if (user?.upi && user.upi.length > 0) {
      setUpiId(user.upi[0]);
      setStep(2);
    }
  }, [user]);

  const handleUpiSubmit = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/users/upi/${user._id}`, { upi: upiId.trim() });
      updateUser({ ...user, upi: [upiId.trim()] });
      toast.success('UPI ID added successfully!');
      setStep(2);
    } catch (error) {
      toast.error('Failed to add UPI ID');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 5) { // Max 5 digits
      setAmount(value);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);

    if (!withdrawAmount || withdrawAmount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawAmount > user?.winning || 0) {
      toast.error('Insufficient winning balance');
      return;
    }

    if (withdrawAmount > 50000) {
      toast.error('Maximum withdrawal amount is ₹50,000');
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      await api.post('/transactions/withdraw', {
        amount: withdrawAmount,
        paymentMethod: 'upi',
        accountDetails: {
          upiId: upiId
        }
      });

      // Update user balance locally
      updateUser({
        ...user,
        totalBalance: user.totalBalance - withdrawAmount,
        winning: user.winning - withdrawAmount
      });

      toast.success('Withdrawal request submitted successfully!');
      navigate('/wallet');
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableBalance = user?.winning || 0;
  const fees = Math.ceil(parseInt(amount || 0) * 0.03); // 3% fee
  const totalDeducted = parseInt(amount || 0) + fees;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Withdraw Money</h1>
            <p className="text-red-100">Instant withdrawal to your account</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mt-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-white text-red-600' : 'bg-white/30 text-white'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded ${
            step >= 2 ? 'bg-white' : 'bg-white/30'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-white text-red-600' : 'bg-white/30 text-white'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 rounded ${
            step >= 3 ? 'bg-white' : 'bg-white/30'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 3 ? 'bg-white text-red-600' : 'bg-white/30 text-white'
          }`}>
            3
          </div>
        </div>

        <div className="flex justify-between text-xs mt-2">
          <span>UPI Setup</span>
          <span>Amount</span>
          <span>Confirm</span>
        </div>
      </div>

      <div className="px-4 py-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* UPI Setup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup UPI for Withdrawals</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">UPI ID Required</div>
                    <div className="text-sm text-blue-700">Enter your UPI ID to receive withdrawals</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your UPI ID (e.g., mobile@paytm, user@oksbi)
                  </p>
                </div>

                <button
                  onClick={handleUpiSubmit}
                  disabled={loading || !upiId.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Setting up UPI...</span>
                    </div>
                  ) : (
                    'Continue to Withdrawal'
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900">First Time Setup</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    UPI setup is required only once. Your UPI ID will be saved for future withdrawals.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Balance Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Available Balance</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(availableBalance)}
                </span>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Winning Balance</div>
                    <div className="text-sm text-green-700">
                      Only winning amount can be withdrawn
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Amount */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Amount</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min: ₹100 • Max: ₹50,000 • Available: {formatCurrency(availableBalance)}
                  </p>
                </div>

                {/* Amount Preview */}
                {amount && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Withdrawal Amount:</span>
                      <span className="font-medium">{formatCurrency(parseInt(amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Fee (3%):</span>
                      <span className="font-medium">{formatCurrency(fees)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>You will receive:</span>
                      <span className="text-green-600">
                        {formatCurrency(parseInt(amount) - fees)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(3)}
                  disabled={!amount || parseInt(amount) < 100 || parseInt(amount) > availableBalance}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  Continue to Confirm
                </button>
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">Important Notes</div>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    <li>• Minimum withdrawal: ₹100</li>
                    <li>• Processing fee: 3% of withdrawal amount</li>
                    <li>• Only winning balance can be withdrawn</li>
                    <li>• Processing time: 1-24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Confirmation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Withdrawal</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">UPI ID</div>
                      <div className="font-medium text-gray-900">{upiId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(parseInt(amount))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Fee</div>
                      <div className="font-medium text-gray-900">{formatCurrency(fees)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">You'll Receive</div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(parseInt(amount) - fees)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      Amount will be credited to your UPI account within 24 hours after verification.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Withdraw ${formatCurrency(parseInt(amount) - fees)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
