import React, { useState } from 'react';
import { X, Server, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const SmtpSettingsModal = ({ isOpen, onClose, currentSmtp, onSaveSmtp, addToast }) => {
  const [config, setConfig] = useState(
    currentSmtp || {
      host: '',
      port: 587,
      secure: false,
      user: '',
      pass: '',
      fromEmail: '',
      fromName: 'Bulk Mail Sender'
    }
  );

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.verifySmtp(config);
      setTestResult(res);
      if (res.success) {
        addToast({ type: 'success', message: res.message });
      } else {
        addToast({ type: 'error', message: res.message });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      addToast({ type: 'error', message: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSmtp(config);
    addToast({
      type: 'success',
      message: 'SMTP settings saved successfully'
    });
    onClose();
  };

  const handleUseGmailPreset = () => {
    setConfig((prev) => ({
      ...prev,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    }));
    addToast({
      type: 'info',
      message: 'Filled Gmail defaults (smtp.gmail.com:465 SSL). Use a Google App Password for authentication.'
    });
  };

  const handleResetToEthereal = () => {
    const defaultSettings = {
      host: '',
      port: 587,
      secure: false,
      user: '',
      pass: '',
      fromEmail: '',
      fromName: 'Bulk Mail App (Test)'
    };
    setConfig(defaultSettings);
    onSaveSmtp(defaultSettings);
    addToast({
      type: 'info',
      message: 'Switched back to Ethereal test inbox sandbox mode.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-gray-900">SMTP Server Configuration</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Quick presets */}
          <div className="flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={handleUseGmailPreset}
              className="text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
            >
              Gmail Preset
            </button>
            <button
              type="button"
              onClick={handleResetToEthereal}
              className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium"
            >
              Reset to Ethereal Test Inbox
            </button>
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200">
            Leave these fields empty to test using <strong>Ethereal Sandbox</strong> (simulated emails with online view links). Or enter your SMTP host and App Password to deliver real emails to actual mailboxes.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Host</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Port</label>
              <input
                type="number"
                placeholder="587 or 465"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="secure"
              checked={config.secure}
              onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="secure" className="text-xs text-gray-700 cursor-pointer">
              Use SSL/TLS (enable for port 465)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username / Email</label>
              <input
                type="text"
                placeholder="you@gmail.com"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">App Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Name (From)</label>
            <input
              type="text"
              placeholder="Bulk Mail Sender"
              value={config.fromName}
              onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`p-2.5 rounded text-xs flex items-start gap-1.5 ${
                testResult.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-xs font-medium text-gray-700"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-xs font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
