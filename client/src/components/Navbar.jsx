import React from 'react';
import { Mail, Send, Clock, BarChart2, Settings, User, LogOut } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenSmtp,
  serverStatus
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg tracking-tight">BulkMail</span>
                <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  MERN
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">React • Node.js • Express • MongoDB</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'compose'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Compose</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Sent History</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* MongoDB status */}
            <div
              title={serverStatus?.mongodb === 'connected' ? 'MongoDB is connected' : 'Connecting to database...'}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus?.mongodb === 'connected' ? 'bg-green-500' : 'bg-amber-400'
                }`}
              />
              <span>{serverStatus?.mongodb === 'connected' ? 'Database Connected' : 'Connecting'}</span>
            </div>

            {/* SMTP Settings */}
            <button
              onClick={onOpenSmtp}
              title="SMTP Settings"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Admin User */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-gray-200">
                <span className="hidden sm:inline text-xs font-semibold text-gray-700">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
