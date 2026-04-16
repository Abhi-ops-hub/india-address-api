import { useState, useEffect } from 'react';
import { api } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Key, Activity, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

export default function PortalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [newKey, setNewKey] = useState(null);

  const loadDashboard = () => {
    api.getPortalDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  const createKey = async () => {
    try {
      const res = await api.createPortalApiKey({ name: keyName || 'New Key' });
      setNewKey(res.data);
      setShowModal(false);
      setKeyName('');
      loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    try {
      await api.deletePortalApiKey(id);
      loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleReveal = (id) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return <div className="page-body"><div className="error-msg">Failed to load dashboard</div></div>;

  const chartData = Object.entries(data.dailyUsage || {}).map(([date, count]) => ({
    date: date.split('-').slice(1).join('/'),
    requests: count
  }));

  return (
    <>
      <div className="page-header">
        <h2>Developer Portal</h2>
        <p>Manage your API keys and monitor usage</p>
      </div>
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card fade-in">
            <div className="stat-icon blue"><Key size={22} /></div>
            <div className="stat-label">API Keys</div>
            <div className="stat-value">{data.totalKeys}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-1">
            <div className="stat-icon green"><Key size={22} /></div>
            <div className="stat-label">Active Keys</div>
            <div className="stat-value">{data.activeKeys}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-2">
            <div className="stat-icon orange"><Activity size={22} /></div>
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{data.totalRequests?.toLocaleString()}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-3">
            <div className="stat-icon purple"><Activity size={22} /></div>
            <div className="stat-label">Today's Usage</div>
            <div className="stat-value">{data.todayUsage}</div>
          </div>
        </div>

        {/* New Key Display */}
        {newKey && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(34,197,94,0.3)' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 12, color: '#4ade80' }}>✓ New API Key Created</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>API KEY</label>
                <div className="api-key-display">
                  <code style={{ flex: 1, wordBreak: 'break-all' }}>{newKey.key}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey.key)}><Copy size={14} /></button>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>SECRET</label>
                <div className="api-key-display">
                  <code style={{ flex: 1, wordBreak: 'break-all' }}>{newKey.secret}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey.secret)}><Copy size={14} /></button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#f97316', marginBottom: 12, padding: '8px 12px', background: 'rgba(249,115,22,0.1)', borderRadius: 8 }}>
                ⚠️ Save your secret now. It won't be shown again.
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => setNewKey(null)}>Dismiss</button>
            </div>
          </div>
        )}

        {/* Usage Chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3>Usage (Last 7 Days)</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }} />
                  <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="url(#colorUsage)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="card">
          <div className="card-header">
            <h3>Your API Keys</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> New Key
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>API Key</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Requests</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.keys.map(k => (
                  <tr key={k.id}>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{k.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ color: '#818cf8', fontSize: 12 }}>
                          {revealedKeys[k.id] ? k.key : k.key.substring(0, 12) + '••••••••'}
                        </code>
                        <button onClick={() => toggleReveal(k.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}>
                          {revealedKeys[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(k.key)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td><span className={`badge badge-${k.plan}`}>{k.plan}</span></td>
                    <td><span className={`badge ${k.active ? 'badge-active' : 'badge-inactive'}`}>{k.active ? 'Active' : 'Inactive'}</span></td>
                    <td>{(k.totalRequests || 0).toLocaleString()}</td>
                    <td>{k.lastUsed ? new Date(k.lastUsed).toLocaleString() : 'Never'}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteKey(k.id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.keys.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No API keys yet. Create one to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Create New API Key</h3>
              <div className="form-group">
                <label>Key Name</label>
                <input className="form-input" placeholder="e.g., Production, Staging" value={keyName}
                  onChange={e => setKeyName(e.target.value)} />
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                New keys start on the Free plan (100 requests/day). Contact admin to upgrade.
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={createKey}>Create Key</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
