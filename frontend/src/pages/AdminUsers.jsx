import { useState, useEffect } from 'react';
import { api } from '../api';
import { UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    api.getUsers()
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleUser = async (id, active) => {
    try {
      await api.updateUser(id, { active: !active });
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage platform users and their access</p>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{users.filter(u => u.active).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Admin Users</div>
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>All Users</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>API Keys</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.company || '—'}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.active ? 'badge-active' : 'badge-inactive'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                    <td>{u.apiKeys}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => toggleUser(u.id, u.active)}
                        disabled={u.role === 'admin'}
                      >
                        {u.active ? <><UserX size={12} /> Disable</> : <><UserCheck size={12} /> Enable</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
