const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to get authorization headers
const getHeaders = (hasBody = true) => {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('bulk_mail_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper with error handling
const request = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getHeaders(options.body !== undefined),
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Server & DB Health
  checkHealth: () => request('/health'),

  // Email API
  sendBulkMail: (payload) =>
    request('/mail/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMailHistory: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    const queryStr = searchParams.toString();
    return request(`/mail/history${queryStr ? `?${queryStr}` : ''}`);
  },

  getMailById: (id) => request(`/mail/history/${id}`),

  deleteMailLog: (id) =>
    request(`/mail/history/${id}`, {
      method: 'DELETE'
    }),

  getStats: () => request('/mail/stats'),

  verifySmtp: (config) =>
    request('/mail/verify-smtp', {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  // Auth API
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getMe: () => request('/auth/me'),

  updateSmtpConfig: (config) =>
    request('/auth/smtp-config', {
      method: 'PUT',
      body: JSON.stringify(config)
    })
};
