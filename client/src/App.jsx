import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MailComposer } from './components/MailComposer';
import { MailHistory } from './components/MailHistory';
import { StatsDashboard } from './components/StatsDashboard';
import { EmailDetailModal } from './components/EmailDetailModal';
import { SmtpSettingsModal } from './components/SmtpSettingsModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history' | 'analytics'
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSmtpOpen, setIsSmtpOpen] = useState(false);

  // Custom SMTP settings saved locally or on profile
  const [currentSmtp, setCurrentSmtp] = useState(() => {
    const saved = localStorage.getItem('bulk_mail_custom_smtp');
    return saved ? JSON.parse(saved) : null;
  });

  // Reusing template in composer
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check backend server and MongoDB status
  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      setServerStatus(res);
    } catch (err) {
      setServerStatus({ mongodb: 'disconnected' });
    }
  }, []);

  // Fetch sent history from database
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getMailHistory({ limit: 100 });
      setHistory(res.data || []);
    } catch (err) {
      console.error('Could not fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch metrics stats from database
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.getStats();
      setStats(res.stats || null);
    } catch (err) {
      console.error('Could not fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Check login state from token
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('bulk_mail_token');
    if (!token) return;

    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        if (res.user.smtpConfig?.host) {
          setCurrentSmtp(res.user.smtpConfig);
        }
      }
    } catch (err) {
      localStorage.removeItem('bulk_mail_token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchCurrentUser();
    fetchHistory();
    fetchStats();
  }, [fetchHealth, fetchCurrentUser, fetchHistory, fetchStats]);

  // When a new email campaign finishes sending
  const handleEmailSent = (newEmailLog) => {
    setHistory((prev) => [newEmailLog, ...prev]);
    fetchStats();
  };

  // Delete an email record from MongoDB
  const handleDeleteEmail = async (id) => {
    try {
      await api.deleteMailLog(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      fetchStats();
      addToast({
        type: 'info',
        message: 'Email record deleted from history'
      });
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Failed to delete record'
      });
    }
  };

  // Populate composer with previous email content
  const handleReuseTemplate = (email) => {
    setComposerSubject(email.subject);
    setComposerBody(email.body);
    setActiveTab('compose');
    addToast({
      type: 'info',
      message: 'Subject and message loaded into composer'
    });
  };

  // Save custom SMTP configuration
  const handleSaveSmtp = async (config) => {
    setCurrentSmtp(config);
    localStorage.setItem('bulk_mail_custom_smtp', JSON.stringify(config));
    if (user) {
      try {
        await api.updateSmtpConfig(config);
      } catch (err) {
        console.error('Failed to sync SMTP to user profile:', err);
      }
    }
  };

  // User logout
  const handleLogout = () => {
    localStorage.removeItem('bulk_mail_token');
    setUser(null);
    addToast({
      type: 'info',
      message: 'Logged out'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSmtp={() => setIsSmtpOpen(true)}
        serverStatus={serverStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'compose' && (
          <MailComposer
            initialSubject={composerSubject}
            initialBody={composerBody}
            onEmailSent={handleEmailSent}
            addToast={addToast}
            currentSmtp={currentSmtp}
            onOpenSmtp={() => setIsSmtpOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <MailHistory
            history={history}
            loading={historyLoading}
            onRefresh={fetchHistory}
            onSelectEmail={(email) => setSelectedEmail(email)}
            onDeleteEmail={handleDeleteEmail}
            onReuseTemplate={handleReuseTemplate}
          />
        )}

        {activeTab === 'analytics' && (
          <StatsDashboard
            stats={stats}
            loading={statsLoading}
            onRefresh={fetchStats}
            onNavigateCompose={() => setActiveTab('compose')}
            onNavigateHistory={() => setActiveTab('history')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-12 text-center text-xs text-gray-500">
        <p>Bulk Mail Application • MERN Stack (React, Node.js, Express, MongoDB) & Nodemailer</p>
      </footer>

      {/* Modals */}
      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
        onDelete={handleDeleteEmail}
      />

      <SmtpSettingsModal
        isOpen={isSmtpOpen}
        onClose={() => setIsSmtpOpen(false)}
        currentSmtp={currentSmtp}
        onSaveSmtp={handleSaveSmtp}
        addToast={addToast}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
        addToast={addToast}
      />
    </div>
  );
}

export default App;
