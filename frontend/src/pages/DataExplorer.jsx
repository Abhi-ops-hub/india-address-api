import { useState, useEffect } from 'react';
import { Search, ChevronRight, Globe, Building, Map, MapPin } from 'lucide-react';

export default function DataExplorer() {
  const [level, setLevel] = useState('states'); // states, districts, subdistricts, villages
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(null);
  const [stats, setStats] = useState(null);

  // Get a demo key for exploration
  const getDemoKey = () => {
    const token = localStorage.getItem('token');
    return token; // We'll use authenticated portal endpoint instead
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/health');
      const health = await res.json();
      setStats(health.data);
      
      // Load states via the summary.json
      const sumRes = await fetch('/api/v1/states?limit=100', {
        headers: getHeaders()
      });
      if (sumRes.ok) {
        const data = await sumRes.json();
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    // For data explorer, we use a special approach
    // The demo key is auto-created, we just need any key
    return { 'x-api-key': 'explorer_demo' };
  };

  const selectState = async (state) => {
    setLoading(true);
    setSelectedState(state);
    setLevel('districts');
    setBreadcrumb([{ type: 'state', name: state.name, data: state }]);
    try {
      const res = await fetch(`/api/v1/states/${state.id}/districts?limit=100`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const selectDistrict = async (district) => {
    setLoading(true);
    setSelectedDistrict(district);
    setLevel('subdistricts');
    setBreadcrumb([
      { type: 'state', name: selectedState.name, data: selectedState },
      { type: 'district', name: district.name, data: district }
    ]);
    try {
      const res = await fetch(`/api/v1/districts/${district.id}/subdistricts?limit=100`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const selectSubdistrict = async (sd) => {
    setLoading(true);
    setSelectedSubdistrict(sd);
    setLevel('villages');
    setBreadcrumb([
      { type: 'state', name: selectedState.name, data: selectedState },
      { type: 'district', name: selectedDistrict.name, data: selectedDistrict },
      { type: 'subdistrict', name: sd.name, data: sd }
    ]);
    try {
      const res = await fetch(`/api/v1/subdistricts/${sd.id}/villages?limit=200`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const goTo = (idx) => {
    if (idx === -1) {
      setLevel('states');
      setBreadcrumb([]);
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      loadData();
    } else {
      const bc = breadcrumb[idx];
      if (bc.type === 'state') {
        selectState(bc.data);
      } else if (bc.type === 'district') {
        selectDistrict(bc.data);
      }
    }
  };

  const filteredItems = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const getIcon = () => {
    switch (level) {
      case 'states': return <Globe size={18} />;
      case 'districts': return <Building size={18} />;
      case 'subdistricts': return <Map size={18} />;
      case 'villages': return <MapPin size={18} />;
      default: return <Globe size={18} />;
    }
  };

  const getColor = () => {
    switch (level) {
      case 'states': return 'rgba(99,102,241,0.15)';
      case 'districts': return 'rgba(249,115,22,0.15)';
      case 'subdistricts': return 'rgba(34,197,94,0.15)';
      case 'villages': return 'rgba(168,85,247,0.15)';
      default: return 'rgba(99,102,241,0.15)';
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Data Explorer</h2>
        <p>Browse India's geographical hierarchy: State → District → Sub-District → Village</p>
      </div>
      <div className="page-body">
        {/* Breadcrumb */}
        <div className="hierarchy-path">
          <div className={`hierarchy-item ${level === 'states' ? 'active' : ''}`} onClick={() => goTo(-1)}>
            🇮🇳 India
          </div>
          {breadcrumb.map((bc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChevronRight size={14} className="hierarchy-separator" />
              <div className={`hierarchy-item ${i === breadcrumb.length - 1 ? 'active' : ''}`}
                onClick={() => i < breadcrumb.length - 1 ? goTo(i) : null}>
                {bc.name}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <div className="search-bar">
            <Search size={18} />
            <input
              placeholder={`Search ${level}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Count */}
        <div style={{ marginBottom: 16, fontSize: 13, color: '#94a3b8' }}>
          Showing {filteredItems.length} {level}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="explorer-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="explorer-item"
                onClick={() => {
                  if (level === 'states') selectState(item);
                  else if (level === 'districts') selectDistrict(item);
                  else if (level === 'subdistricts') selectSubdistrict(item);
                }}
                style={{ cursor: level === 'villages' ? 'default' : 'pointer' }}
              >
                <div className="item-icon" style={{ background: getColor() }}>
                  {getIcon()}
                </div>
                <div>
                  <div className="item-name">{item.name}</div>
                  {level === 'villages' && (
                    <div className="item-count" style={{ fontSize: 11 }}>
                      Code: {item.code}
                    </div>
                  )}
                  {item.state_name && level !== 'states' && (
                    <div className="item-count">{item.state_name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="empty-state">
            <Search size={40} />
            <h3>No results found</h3>
            <p>Try adjusting your search query</p>
          </div>
        )}
      </div>
    </>
  );
}
