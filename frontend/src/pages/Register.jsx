import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      setApiKey(data.apiKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (apiKey) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">✓</div>
            <h2>Registration Complete!</h2>
            <p>Your API key has been generated. Save it securely.</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>YOUR API KEY</label>
            <div className="api-key-display">
              <code style={{ flex: 1, wordBreak: 'break-all' }}>{apiKey.key}</code>
              <button onClick={() => navigator.clipboard.writeText(apiKey.key)} title="Copy">📋</button>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>SECRET</label>
            <div className="api-key-display">
              <code style={{ flex: 1, wordBreak: 'break-all' }}>{apiKey.secret}</code>
              <button onClick={() => navigator.clipboard.writeText(apiKey.secret)} title="Copy">📋</button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#f97316', marginBottom: 20, padding: '8px 12px', background: 'rgba(249,115,22,0.1)', borderRadius: 8 }}>
            ⚠️ Save your secret now. It won't be shown again.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/portal')} style={{ width: '100%', justifyContent: 'center' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">B</div>
          <h2>Create Account</h2>
          <p>Get your free API key instantly</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" className="form-input" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="form-input" placeholder="john@company.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="company">Company (Optional)</label>
            <input id="company" name="company" className="form-input" placeholder="Your Company"
              value={form.company} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account & Get API Key'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
