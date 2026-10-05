import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle, Trash2, Calendar } from 'lucide-react';

export const EmailDetailModal = ({ email, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState('preview');

  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  email.status === 'sent'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : email.status === 'partial'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {email.status.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(email.createdAt).toLocaleString()}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{email.subject}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs">
          <div>
            <span className="text-gray-500">Recipients:</span>{' '}
            <span className="font-semibold text-gray-800">{email.recipientCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Delivered:</span>{' '}
            <span className="font-semibold text-green-600">{email.successCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Failed:</span>{' '}
            <span className="font-semibold text-red-600">{email.failureCount}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-4 border-b border-gray-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email Preview
          </button>
          <button
            onClick={() => setActiveTab('recipients')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'recipients'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Recipients List ({email.results?.length || email.recipients?.length})
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'preview' ? (
            <div className="space-y-3">
              {email.previewUrl && (
                <div className="flex items-center justify-between p-2.5 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  <span>This email was sent via Ethereal sandbox testing.</span>
                  <a
                    href={email.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                  >
                    <span>Open in Web Inbox</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="border border-gray-200 rounded p-4 bg-white text-gray-800 shadow-inner min-h-[200px]">
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: email.body }}
                />
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Info / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {(email.results || []).map((r, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 text-gray-800 font-sans">{r.email}</td>
                      <td className="py-2 px-3">
                        {r.status === 'sent' ? (
                          <span className="text-green-600 font-medium">Sent</span>
                        ) : (
                          <span className="text-red-600 font-medium">Failed</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-500 truncate max-w-[200px]">
                        {r.error || r.messageId || 'Delivered'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Delete this email log from MongoDB?')) {
                onDelete(email._id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Log</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
