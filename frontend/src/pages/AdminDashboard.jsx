import { useState, useEffect } from 'react';
import { api } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Key, Activity, Globe, MapPin, Building, Map } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return <div className="page-body"><div className="error-msg">Failed to load dashboard</div></div>;

  const { overview, planBreakdown, recentKeys, dailyRequests } = data;
  const chartData = Object.entries(dailyRequests).map(([date, count]) => ({
    date: date.split('-').slice(1).join('/'),
    requests: count
  }));

  return (
    <>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of your platform metrics and usage</p>
      </div>
      <div className="page-body">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card fade-in">
            <div className="stat-icon blue"><Globe size={22} /></div>
            <div className="stat-label">Total States</div>
            <div className="stat-value">{overview.totalStates}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-1">
            <div className="stat-icon orange"><Building size={22} /></div>
            <div className="stat-label">Total Districts</div>
            <div className="stat-value">{overview.totalDistricts?.toLocaleString()}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-2">
            <div className="stat-icon green"><Map size={22} /></div>
            <div className="stat-label">Sub-Districts</div>
            <div className="stat-value">{overview.totalSubdistricts?.toLocaleString()}</div>
          </div>
          <div className="stat-card fade-in fade-in-delay-3">
            <div className="stat-icon purple"><MapPin size={22} /></div>
            <div className="stat-label">Total Villages</div>
            <div className="stat-value">{overview.totalVillages?.toLocaleString()}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{overview.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Key size={22} /></div>
            <div className="stat-label">API Keys</div>
            <div className="stat-value">{overview.totalApiKeys}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Key size={22} /></div>
            <div className="stat-label">Active Keys</div>
            <div className="stat-value">{overview.activeKeys}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Activity size={22} /></div>
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{overview.totalRequests?.toLocaleString()}</div>
          </div>
        </div>

        <div className="two-col">
          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <h3>API Requests (Last 7 Days)</h3>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="url(#colorReq)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="card">
            <div className="card-header">
              <h3>Keys by Plan</h3>
            </div>
            <div className="card-body">
              {Object.entries(planBreakdown).map(([plan, count]) => (
                <div key={plan} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge badge-${plan}`}>{plan}</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent API Keys */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3>Recent API Keys</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Requests</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentKeys.map(k => (
                  <tr key={k.id}>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{k.name}</td>
                    <td><code style={{ color: '#818cf8', fontSize: 12 }}>{k.key}</code></td>
                    <td><span className={`badge badge-${k.plan}`}>{k.plan}</span></td>
                    <td><span className={`badge ${k.active ? 'badge-active' : 'badge-inactive'}`}>{k.active ? 'Active' : 'Inactive'}</span></td>
                    <td>{k.totalRequests.toLocaleString()}</td>
                    <td>{new Date(k.createdAt).toLocaleDateString()}</td>
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
