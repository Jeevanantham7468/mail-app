import React, { useState } from 'react';
import { Search, ExternalLink, Eye, Trash2, RotateCcw, Clock, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const MailHistory = ({
  history,
  loading,
  onRefresh,
  onSelectEmail,
  onDeleteEmail,
  onReuseTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipients.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" /> Sent
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Partial
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top search & filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sent Email History</h2>
          <p className="text-xs text-gray-500">Emails dispatched and recorded in MongoDB</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subject or email..."
              className="pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-md border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
          </select>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh history"
            className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      {loading && history.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Fetching email history from MongoDB...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-gray-300 rounded-lg bg-white p-6">
          <Mail className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No sent emails found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter !== 'all'
              ? 'No records match your search criteria.'
              : 'You haven’t sent any bulk emails yet. Use the Compose tab to create one!'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/70 transition">
                    {/* Subject */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 text-sm truncate" title={item.subject}>
                        {item.subject}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 truncate max-w-sm">
                        {item.body.replace(/<[^>]*>?/gm, '')}
                      </div>
                    </td>

                    {/* Recipients */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-gray-800">{item.recipientCount} emails</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[140px]" title={item.recipients.join(', ')}>
                        {item.recipients[0]}
                        {item.recipients.length > 1 ? ` +${item.recipients.length - 1} more` : ''}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {item.successCount} sent, {item.failureCount} failed
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.previewUrl && (
                          <a
                            href={item.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview online"
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onSelectEmail(item)}
                          title="View details"
                          className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onReuseTemplate(item)}
                          title="Reuse in composer"
                          className="p-1 rounded text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Delete this email record from MongoDB?')) {
                              onDeleteEmail(item._id);
                            }
                          }}
                          title="Delete"
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
