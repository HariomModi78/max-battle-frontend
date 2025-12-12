import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Mail,
  Send,
  Users,
  User,
  Search,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const AdminSendEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminId } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    sendToAll: false
  });

  useEffect(() => {
    if (!emailData.sendToAll) {
      fetchUsers();
    }
  }, [emailData.sendToAll]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users.filter(u => u.isActive)); // Only active users
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(u => u._id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    if (!emailData.sendToAll && selectedUsers.length === 0) {
      toast.error('Please select at least one user or choose "Send to All"');
      return;
    }

    setSending(true);

    try {
      const payload = {
        subject: emailData.subject.trim(),
        message: emailData.message.trim(),
        sendToAll: emailData.sendToAll,
        userIds: emailData.sendToAll ? [] : selectedUsers
      };

      const response = await api.post('/admin/send-email', payload);

      if (response.data.success) {
        toast.success(`Email sent successfully to ${response.data.recipientCount} users`);
        // Reset form
        setEmailData({
          subject: '',
          message: '',
          sendToAll: false
        });
        setSelectedUsers([]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(`/adminPanel/${adminId}`)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Mail className="h-7 w-7 mr-3" />
              Send Email
            </h1>
            <p className="text-indigo-100 mt-1">Send emails to users</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Email Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Compose Email</h2>

            <div className="space-y-4">
              {/* Send to All Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={emailData.sendToAll}
                  onChange={(e) => setEmailData(prev => ({
                    ...prev,
                    sendToAll: e.target.checked
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium text-gray-700">
                  Send to all active users ({users.length} users)
                </label>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                  placeholder="Email message content"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendEmail}
                disabled={sending || (!emailData.sendToAll && selectedUsers.length === 0)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {sending ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Email {emailData.sendToAll ? `to ${users.length} users` : `to ${selectedUsers.length} users`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Selection */}
          {!emailData.sendToAll && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Select Recipients</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllUsers}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  filteredUsers.map((userData) => (
                    <div
                      key={userData._id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUsers.includes(userData._id)
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleUserSelection(userData._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {userData.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {userData.username}
                          </p>
                          <p className="text-xs text-gray-600">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                      {selectedUsers.includes(userData._id) && (
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email Preview */}
        {(emailData.subject || emailData.message) && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <strong>Subject:</strong> {emailData.subject || '(No subject)'}
              </div>
              <div className="whitespace-pre-wrap">
                <strong>Message:</strong><br />
                {emailData.message || '(No message)'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSendEmail;