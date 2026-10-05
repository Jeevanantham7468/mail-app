import React from 'react';
import { Send, CheckCircle, AlertTriangle, Layers, RefreshCw, ArrowRight } from 'lucide-react';

export const StatsDashboard = ({ stats, loading, onRefresh, onNavigateCompose, onNavigateHistory }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Campaign Analytics</h2>
          <p className="text-xs text-gray-500">Live delivery metrics stored in MongoDB</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Campaigns</span>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalCampaigns ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Campaigns stored</p>
        </div>

        {/* Total Recipients */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Recipients</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalEmails ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Processed email targets</p>
        </div>

        {/* Successful Emails */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">{stats?.totalSuccess ?? 0}</span>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
              {stats?.successRate ?? 0}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Confirmed sent</p>
        </div>

        {/* Failed Emails */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats?.totalFailed ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">Failed delivery attempts</p>
        </div>
      </div>

      {/* Helpful Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Send a New Email Campaign</h3>
            <p className="text-xs text-gray-500 mt-1">
              Compose HTML messages, upload recipients via CSV or TXT, and send in batches using Nodemailer.
            </p>
          </div>
          <button
            onClick={onNavigateCompose}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>Open Composer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Review Email History</h3>
            <p className="text-xs text-gray-500 mt-1">
              Inspect historical delivery reports, filter by status, and view online email previews.
            </p>
          </div>
          <button
            onClick={onNavigateHistory}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
