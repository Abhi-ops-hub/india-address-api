const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Admin
  getDashboard: () => request('/admin/dashboard'),
  getUsers: () => request('/admin/users'),
  updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminApiKeys: () => request('/admin/api-keys'),
  createAdminApiKey: (data) => request('/admin/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminApiKey: (id, data) => request(`/admin/api-keys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminApiKey: (id) => request(`/admin/api-keys/${id}`, { method: 'DELETE' }),
  getAnalytics: () => request('/admin/analytics'),

  // Portal (B2B)
  getPortalDashboard: () => request('/portal/dashboard'),
  createPortalApiKey: (data) => request('/portal/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  updatePortalApiKey: (id, data) => request(`/portal/api-keys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePortalApiKey: (id) => request(`/portal/api-keys/${id}`, { method: 'DELETE' }),

  // Public API (uses API key)
  searchPublic: (query, apiKey) => fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(query)}&limit=20`, {
    headers: { 'x-api-key': apiKey }
  }).then(r => r.json()),

  // Health
  getHealth: () => fetch(`${API_BASE}/health`).then(r => r.json())
};
