import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Search, ArrowRight, Globe, Zap, Shield, Database, MapPin, Code } from 'lucide-react';

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [demoKey, setDemoKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getHealth().then(data => setStats(data.data)).catch(() => {});
    // Get demo API key from health
    fetch('/health').then(r => r.json()).then(d => {
      setStats(d.data);
    }).catch(() => {});
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`, {
        headers: { 'x-api-key': 'demo' }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      }
    } catch { setSearchResults([]); }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="logo-icon">B</div>
          <h1>Bharat Address API</h1>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get API Key <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <h1 className="fade-in">India's Complete Village-Level Geographical Data API</h1>
        <p className="hero-subtitle fade-in fade-in-delay-1">
          Access standardized address data for all Indian states, districts, sub-districts, and villages.
          Built for B2B clients who need reliable, hierarchical address data for drop-down menus and form autocomplete.
        </p>
        <div className="fade-in fade-in-delay-2" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
            Start Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: 15 }}>
            View Dashboard
          </Link>
        </div>

        <div className="hero-stats fade-in fade-in-delay-3">
          <div className="hero-stat">
            <div className="value">{stats?.states || 29}+</div>
            <div className="label">States & UTs</div>
          </div>
          <div className="hero-stat">
            <div className="value">{stats?.districts ? stats.districts.toLocaleString() : '536'}+</div>
            <div className="label">Districts</div>
          </div>
          <div className="hero-stat">
            <div className="value">{stats?.subdistricts ? stats.subdistricts.toLocaleString() : '5,422'}+</div>
            <div className="label">Sub-Districts</div>
          </div>
          <div className="hero-stat">
            <div className="value">{stats?.villages ? (stats.villages / 1000).toFixed(0) + 'K' : '564K'}+</div>
            <div className="label">Villages</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Why Bharat Address API?</h2>
        <div className="features-grid">
          <div className="feature-card fade-in">
            <div className="feature-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Database size={24} />
            </div>
            <h3>Complete Coverage</h3>
            <p>Data for all Indian states, districts, sub-districts, and villages. Normalized and standardized from Census 2011 data.</p>
          </div>
          <div className="feature-card fade-in fade-in-delay-1">
            <div className="feature-icon" style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
              <Zap size={24} />
            </div>
            <h3>Lightning Fast</h3>
            <p>In-memory data architecture delivers sub-100ms response times. Optimized for high-throughput applications.</p>
          </div>
          <div className="feature-card fade-in fade-in-delay-2">
            <div className="feature-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
              <Search size={24} />
            </div>
            <h3>Search & Autocomplete</h3>
            <p>Global search across all levels. Hierarchical autocomplete perfect for address form drop-down menus.</p>
          </div>
          <div className="feature-card fade-in fade-in-delay-3">
            <div className="feature-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
              <MapPin size={24} />
            </div>
            <h3>Hierarchical Data</h3>
            <p>Country → State → District → Sub-District → Village. Standardized format ready for cascading dropdowns.</p>
          </div>
          <div className="feature-card fade-in fade-in-delay-3">
            <div className="feature-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}>
              <Shield size={24} />
            </div>
            <h3>Secure & Reliable</h3>
            <p>JWT authentication, API key management, rate limiting, and comprehensive security with Helmet.js.</p>
          </div>
          <div className="feature-card fade-in fade-in-delay-4">
            <div className="feature-icon" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>
              <Code size={24} />
            </div>
            <h3>Developer Friendly</h3>
            <p>RESTful API with comprehensive documentation, pagination, and consistent JSON responses.</p>
          </div>
        </div>
      </section>

      {/* API Example */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Simple Integration</h2>
        <div className="code-block" style={{ fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#64748b' }}>// Search for villages</div>
          <div>
            <span style={{ color: '#818cf8' }}>const</span> response = <span style={{ color: '#818cf8' }}>await</span> <span style={{ color: '#f97316' }}>fetch</span>(
          </div>
          <div style={{ paddingLeft: 20 }}>
            <span style={{ color: '#4ade80' }}>'https://api.bharataddress.com/api/v1/search?q=pune'</span>,
          </div>
          <div style={{ paddingLeft: 20 }}>
            {'{'} headers: {'{'} <span style={{ color: '#4ade80' }}>'x-api-key'</span>: <span style={{ color: '#4ade80' }}>'your_api_key'</span> {'}'} {'}'}
          </div>
          <div>);</div>
          <br />
          <div style={{ color: '#64748b' }}>// Response</div>
          <div>{'{'}</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#4ade80' }}>"success"</span>: <span style={{ color: '#818cf8' }}>true</span>,</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#4ade80' }}>"data"</span>: [{'{'}</div>
          <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"type"</span>: <span style={{ color: '#4ade80' }}>"village"</span>,</div>
          <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"name"</span>: <span style={{ color: '#4ade80' }}>"Pune"</span>,</div>
          <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"full_address"</span>: <span style={{ color: '#4ade80' }}>"Pune, Haveli, Pune, Maharashtra, India"</span></div>
          <div style={{ paddingLeft: 20 }}>{'}]'}</div>
          <div>{'}'}</div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">₹0</div>
            <div className="period">forever</div>
            <ul className="feature-list">
              <li>100 requests/day</li>
              <li>All endpoints</li>
              <li>1 API key</li>
              <li>Community support</li>
            </ul>
            <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
          </div>
          <div className="pricing-card">
            <h3>Premium</h3>
            <div className="price">₹999</div>
            <div className="period">/month</div>
            <ul className="feature-list">
              <li>1,000 requests/day</li>
              <li>All endpoints</li>
              <li>3 API keys</li>
              <li>Email support</li>
            </ul>
            <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Choose Plan</Link>
          </div>
          <div className="pricing-card featured">
            <h3>Pro</h3>
            <div className="price">₹4,999</div>
            <div className="period">/month</div>
            <ul className="feature-list">
              <li>10,000 requests/day</li>
              <li>All endpoints</li>
              <li>5 API keys</li>
              <li>Priority support</li>
              <li>Analytics dashboard</li>
            </ul>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Choose Plan</Link>
          </div>
          <div className="pricing-card">
            <h3>Unlimited</h3>
            <div className="price">₹14,999</div>
            <div className="period">/month</div>
            <ul className="feature-list">
              <li>Unlimited requests</li>
              <li>All endpoints</li>
              <li>Unlimited keys</li>
              <li>Dedicated support</li>
              <li>Custom SLA</li>
            </ul>
            <Link to="/register" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2024 Bharat Address API. Built for India's digital infrastructure.</p>
      </footer>
    </div>
  );
}
