import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { api } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, addToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      if (res.token) {
        localStorage.setItem('bulk_mail_token', res.token);
      }

      onAuthSuccess(res.user);
      addToast({
        type: 'success',
        message: isLogin ? 'Signed in successfully' : 'Account created'
      });
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Authentication failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setFormData({
      name: 'Admin',
      email: 'admin@bulkmail.com',
      password: 'admin123'
    });
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            {isLogin ? 'Admin Sign In' : 'Create Admin Account'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick Demo Pre-fill */}
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-xs flex items-center justify-between text-blue-900">
            <div>
              <span className="font-semibold">Demo credentials:</span>
              <div className="text-[11px] text-blue-700">admin@bulkmail.com / admin123</div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="px-2 py-1 bg-white hover:bg-blue-100 border border-blue-300 rounded text-blue-700 text-xs font-medium"
            >
              Auto Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Admin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="admin@bulkmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
            >
              {isLogin ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}</span>
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center text-xs text-gray-500">
            {isLogin ? (
              <span>
                Don't have an admin account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
