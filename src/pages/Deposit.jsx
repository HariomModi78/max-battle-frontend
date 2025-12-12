import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CreditCard, Smartphone, Banknote, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

const Deposit = () => {
  const { user, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: amount selection, 2: payment method, 3: processing

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 5) { // Max 5 digits
      setAmount(value);
    }
  };

  const handleContinue = () => {
    if (!amount || parseInt(amount) < 1) {
      toast.error('Minimum deposit amount is ₹1');
      return;
    }
    if (parseInt(amount) > 10000) {
      toast.error('Maximum deposit amount is ₹10,000');
      return;
    }
    setStep(2);
  };

  const handlePayment = async (method) => {
    setLoading(true);
    setStep(3);

    try {
      // Create Razorpay order
      console.log('Creating Razorpay order for amount:', amount);
      console.log('API base URL:', api.defaults.baseURL);

      const response = await api.post('/transactions/create-order', {
        amount: parseInt(amount),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          type: 'deposit'
        }
      });

      console.log('Razorpay order response:', response.data);
      console.log('Response status:', response.status);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment order');
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log('Razorpay key:', razorpayKey);

      if (!razorpayKey ||
          razorpayKey === 'rzp_test_your_key_here' ||
          razorpayKey.includes('your_') ||
          razorpayKey.length < 20) {
        toast.error(`Razorpay key missing or invalid. Current key: "${razorpayKey}". Please check your frontend/.env file.`);
        console.error('Razorpay configuration issue:', { key: razorpayKey, length: razorpayKey?.length });
        setStep(2);
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: 'Max Battle',
        description: `Deposit ₹${amount}`,
        order_id: response.data.order.id,
        handler: async function (response) {
          try {
            console.log('Payment successful, verifying...', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            // Verify payment
            const verifyResponse = await api.post('/transactions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('Payment verification response:', verifyResponse.data);

            // Refresh user data to get updated balance
            console.log('Refreshing user data after payment...');
            await checkAuthStatus();
            console.log('User data after refresh:', user);

            toast.success('Payment successful! Amount added to your wallet.');
            navigate('/wallet');
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error.response?.data?.message || 'Payment verification failed. Please contact support if amount was debited.';
            toast.error(errorMessage);
            setStep(2);
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setStep(2);
            toast.error('Payment cancelled');
          }
        }
      };

      console.log('Checking Razorpay SDK...');
      console.log('window.Razorpay:', typeof window.Razorpay);

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Razorpay SDK not loaded. Please refresh the page and try again.');
        console.error('Razorpay SDK not loaded');
        setStep(2);
        setLoading(false);
        return;
      }

      console.log('Razorpay SDK loaded successfully');

      try {
        console.log('Creating Razorpay instance with options:', {
          ...options,
          key: options.key ? '***' + options.key.slice(-4) : 'MISSING'
        });

        const rzp = new window.Razorpay(options);
        console.log('Razorpay instance created successfully');

        rzp.open();
        console.log('Razorpay checkout opened');
      } catch (rzpError) {
        console.error('Razorpay instance creation error:', rzpError);
        toast.error('Failed to initialize payment gateway. Please try again.');
        setStep(2);
        setLoading(false);
        return;
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(errorMessage);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay',
      color: 'bg-blue-500'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Paytm, Google Pay, PhonePe',
      color: 'bg-purple-500'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Banknote,
      description: 'All major banks',
      color: 'bg-green-500'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Add Money</h1>
            <p className="text-green-100">Instant deposit to your wallet</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mt-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded ${
            step >= 2 ? 'bg-white' : 'bg-white/30'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 rounded ${
            step >= 3 ? 'bg-white' : 'bg-white/30'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 3 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
          }`}>
            3
          </div>
        </div>

        <div className="flex justify-between text-xs mt-2">
          <span>Amount</span>
          <span>Payment</span>
          <span>Confirm</span>
        </div>
      </div>

      <div className="px-4 py-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Quick Amount Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Amount</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAmountSelect(amt)}
                    className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                      amount === amt.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleCustomAmount}
                    placeholder="Enter amount (₹1 - ₹10,000)"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₹1 • Maximum: ₹10,000
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!amount || parseInt(amount) < 1}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Deposit Amount</span>
                <span className="text-xl font-bold text-gray-900">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Processing Fee</span>
                <span>₹0</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span className="text-xl text-blue-600">₹{amount}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePayment(method.id)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                        <div className="text-gray-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Secure Payment</div>
                  <div className="text-sm text-green-700 mt-1">
                    Your payment is protected by 256-bit SSL encryption and Razorpay's secure gateway.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please complete the payment in the popup window</p>
            <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
