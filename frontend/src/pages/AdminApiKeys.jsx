import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Trash2, Copy } from 'lucide-react';

export default function AdminApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [form, setForm] = useState({ name: '', plan: 'free' });

  const loadKeys = () => {
    api.getAdminApiKeys()
      .then(res => setKeys(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadKeys(); }, []);

  const createKey = async () => {
    try {
      const res = await api.createAdminApiKey(form);
      setNewKey(res.data);
      setShowModal(false);
      loadKeys();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('Delete this API key?')) return;
    try {
      await api.deleteAdminApiKey(id);
      loadKeys();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleKey = async (id, active) => {
    try {
      await api.updateAdminApiKey(id, { active: !active });
      loadKeys();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>API Key Management</h2>
        <p>Issue and manage API keys for all users</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create API Key
          </button>
        </div>

        {/* New Key Display */}
        {newKey && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(34,197,94,0.3)' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 12, color: '#4ade80' }}>✓ New API Key Created</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>KEY</label>
                <div className="api-key-display">
                  <code style={{ flex: 1 }}>{newKey.key}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey.key)}><Copy size={14} /></button>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>SECRET</label>
                <div className="api-key-display">
                  <code style={{ flex: 1 }}>{newKey.secret}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey.secret)}><Copy size={14} /></button>
                </div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => setNewKey(null)}>Dismiss</button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Requests</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id}>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{k.name}</td>
                    <td><code style={{ color: '#818cf8', fontSize: 12 }}>{k.key}</code></td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: 12, width: 'auto', background: 'transparent' }}
                        value={k.plan}
                        onChange={(e) => api.updateAdminApiKey(k.id, { plan: e.target.value }).then(loadKeys)}
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </td>
                    <td>
                      <button className={`badge ${k.active ? 'badge-active' : 'badge-inactive'}`} style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => toggleKey(k.id, k.active)}>
                        {k.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{k.totalRequests.toLocaleString()}</td>
                    <td>{k.lastUsed ? new Date(k.lastUsed).toLocaleString() : 'Never'}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteKey(k.id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                <input className="form-input" placeholder="e.g., Production Key" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select className="form-input" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                  <option value="free">Free (100 req/day)</option>
                  <option value="premium">Premium (1,000 req/day)</option>
                  <option value="pro">Pro (10,000 req/day)</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
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
