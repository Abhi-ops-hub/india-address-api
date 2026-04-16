import { useState, useEffect } from 'react';
import { api } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#f97316', '#22c55e', '#a855f7', '#f43f5e', '#14b8a6'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return <div className="page-body"><div className="error-msg">Failed to load analytics</div></div>;

  const dailyChart = Object.entries(data.dailyData || {}).map(([date, count]) => ({
    date: date.split('-').slice(1).join('/'),
    requests: count
  }));

  const planData = data.topKeys.reduce((acc, k) => {
    acc[k.plan] = (acc[k.plan] || 0) + k.totalRequests;
    return acc;
  }, {});
  const pieData = Object.entries(planData).map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Platform usage insights and metrics</p>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total API Requests</div>
            <div className="stat-value">{data.totalRequests?.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active API Keys</div>
            <div className="stat-value">{data.topKeys?.length || 0}</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-header"><h3>Daily API Requests</h3></div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Requests by Plan</h3></div>
            <div className="card-body">
              <div className="chart-container">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state"><p>No data yet</p></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><h3>Top API Keys by Usage</h3></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Plan</th>
                  <th>Total Requests</th>
                </tr>
              </thead>
              <tbody>
                {data.topKeys.map((k, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: i < 3 ? '#f97316' : '#94a3b8' }}>#{i + 1}</td>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{k.name}</td>
                    <td><code style={{ color: '#818cf8', fontSize: 12 }}>{k.key}</code></td>
                    <td><span className={`badge badge-${k.plan}`}>{k.plan}</span></td>
                    <td style={{ fontWeight: 600 }}>{k.totalRequests.toLocaleString()}</td>
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
