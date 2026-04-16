export default function ApiDocs() {
  const endpoints = [
    {
      method: 'GET', path: '/api/v1/states', desc: 'List all states',
      params: 'search, page, limit',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/states`
    },
    {
      method: 'GET', path: '/api/v1/states/:id/districts', desc: 'List districts in a state',
      params: 'search, page, limit',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/states/1/districts`
    },
    {
      method: 'GET', path: '/api/v1/districts/:id/subdistricts', desc: 'List sub-districts in a district',
      params: 'search, page, limit',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/districts/1/subdistricts`
    },
    {
      method: 'GET', path: '/api/v1/subdistricts/:id/villages', desc: 'List villages in a sub-district',
      params: 'search, page, limit',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/subdistricts/1/villages`
    },
    {
      method: 'GET', path: '/api/v1/search', desc: 'Global search across all levels',
      params: 'q (required, min 2 chars), type (state|district|subdistrict|village), limit',
      example: `curl -H "x-api-key: YOUR_KEY" "https://localhost:3001/api/v1/search?q=mumbai"`
    },
    {
      method: 'GET', path: '/api/v1/autocomplete', desc: 'Autocomplete for form dropdowns',
      params: 'q (required), state_id, district_id, subdistrict_id, limit',
      example: `curl -H "x-api-key: YOUR_KEY" "https://localhost:3001/api/v1/autocomplete?q=mum&state_id=1"`
    },
    {
      method: 'GET', path: '/api/v1/hierarchy/:villageId', desc: 'Get full hierarchy path for a village',
      params: 'none',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/hierarchy/12345`
    },
    {
      method: 'GET', path: '/api/v1/stats', desc: 'Get dataset statistics',
      params: 'none',
      example: `curl -H "x-api-key: YOUR_KEY" https://localhost:3001/api/v1/stats`
    }
  ];

  return (
    <>
      <div className="page-header">
        <h2>API Documentation</h2>
        <p>Complete reference for the Bharat Address REST API v1</p>
      </div>
      <div className="page-body">
        {/* Quick Start */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>🚀 Quick Start</h3></div>
          <div className="card-body">
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 14 }}>
              All API requests require an API key. Include it via the <code style={{ color: '#818cf8' }}>x-api-key</code> header
              or <code style={{ color: '#818cf8' }}>api_key</code> query parameter.
            </p>
            <div className="code-block">
              <div style={{ color: '#64748b' }}>// JavaScript Example</div>
              <div><span style={{ color: '#818cf8' }}>const</span> response = <span style={{ color: '#818cf8' }}>await</span> <span style={{ color: '#f97316' }}>fetch</span>(<span style={{ color: '#4ade80' }}>'/api/v1/states'</span>, {'{'}</div>
              <div style={{ paddingLeft: 20 }}>headers: {'{'} <span style={{ color: '#4ade80' }}>'x-api-key'</span>: <span style={{ color: '#4ade80' }}>'your_api_key_here'</span> {'}'}</div>
              <div>{'}'});</div>
              <div><span style={{ color: '#818cf8' }}>const</span> data = <span style={{ color: '#818cf8' }}>await</span> response.<span style={{ color: '#f97316' }}>json</span>();</div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>🔐 Authentication</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Header Authentication (Recommended)</h4>
                <code style={{ color: '#818cf8', fontSize: 13 }}>x-api-key: ba_your_api_key_here</code>
              </div>
              <div style={{ padding: 16, background: 'rgba(249,115,22,0.08)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.15)' }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Query Parameter</h4>
                <code style={{ color: '#fb923c', fontSize: 13 }}>/api/v1/states?api_key=ba_your_api_key_here</code>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>⚡ Rate Limits</h3></div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Plan</th><th>Daily Limit</th><th>Price</th></tr>
                </thead>
                <tbody>
                  <tr><td><span className="badge badge-free">Free</span></td><td>100 requests/day</td><td>₹0</td></tr>
                  <tr><td><span className="badge badge-premium">Premium</span></td><td>1,000 requests/day</td><td>₹999/mo</td></tr>
                  <tr><td><span className="badge badge-pro">Pro</span></td><td>10,000 requests/day</td><td>₹4,999/mo</td></tr>
                  <tr><td><span className="badge badge-unlimited">Unlimited</span></td><td>Unlimited</td><td>₹14,999/mo</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>📡 Endpoints</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {endpoints.map((ep, i) => (
              <div key={i} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'rgba(34,197,94,0.15)',
                    color: '#4ade80'
                  }}>{ep.method}</span>
                  <code style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{ep.path}</code>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{ep.desc}</p>
                {ep.params && (
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    <strong>Parameters:</strong> {ep.params}
                  </div>
                )}
                <div className="code-block" style={{ fontSize: 12, padding: 12, background: '#020617' }}>
                  {ep.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Format */}
        <div className="card">
          <div className="card-header"><h3>📦 Response Format</h3></div>
          <div className="card-body">
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 14 }}>
              All successful responses follow this format:
            </p>
            <div className="code-block" style={{ fontSize: 13 }}>
              <div>{'{'}</div>
              <div style={{ paddingLeft: 20 }}><span style={{ color: '#4ade80' }}>"success"</span>: <span style={{ color: '#818cf8' }}>true</span>,</div>
              <div style={{ paddingLeft: 20 }}><span style={{ color: '#4ade80' }}>"data"</span>: [...],</div>
              <div style={{ paddingLeft: 20 }}><span style={{ color: '#4ade80' }}>"pagination"</span>: {'{'}</div>
              <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"page"</span>: <span style={{ color: '#f97316' }}>1</span>,</div>
              <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"limit"</span>: <span style={{ color: '#f97316' }}>50</span>,</div>
              <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"total"</span>: <span style={{ color: '#f97316' }}>536</span>,</div>
              <div style={{ paddingLeft: 40 }}><span style={{ color: '#4ade80' }}>"pages"</span>: <span style={{ color: '#f97316' }}>11</span></div>
              <div style={{ paddingLeft: 20 }}>{'}'}</div>
              <div>{'}'}</div>
            </div>

            <p style={{ color: '#94a3b8', marginTop: 24, marginBottom: 16, fontSize: 14 }}>
              Standardized address format returned for villages:
            </p>
            <div style={{ padding: 16, background: 'rgba(168,85,247,0.08)', borderRadius: 10, border: '1px solid rgba(168,85,247,0.15)' }}>
              <code style={{ color: '#a855f7', fontSize: 14 }}>
                Area Name (Village), Sub-District, District, State, India
              </code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
