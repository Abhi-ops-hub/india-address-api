const express = require('express');
const router = express.Router();
const { verifyApiKey } = require('../middleware/auth');

// Apply API key verification to all routes
router.use(verifyApiKey);

// GET /api/v1/states - List all states
router.get('/states', (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  let states = req.app.locals.geoData.states;

  if (search) {
    const q = search.toLowerCase();
    states = states.filter(s => s.name.toLowerCase().includes(q));
  }

  const total = states.length;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 100);
  const paginated = states.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) }
  });
});

// GET /api/v1/states/:stateId - Get state by ID
router.get('/states/:stateId', (req, res) => {
  const state = req.app.locals.geoData.stateById[req.params.stateId];
  if (!state) return res.status(404).json({ error: 'State not found.' });
  res.json({ success: true, data: state });
});

// GET /api/v1/states/:stateId/districts - List districts in a state
router.get('/states/:stateId/districts', (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const stateId = parseInt(req.params.stateId);
  let districts = req.app.locals.geoData.districtsByState[stateId] || [];

  if (search) {
    const q = search.toLowerCase();
    districts = districts.filter(d => d.name.toLowerCase().includes(q));
  }

  const total = districts.length;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 100);
  const paginated = districts.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) }
  });
});

// GET /api/v1/districts/:districtId - Get district by ID
router.get('/districts/:districtId', (req, res) => {
  const district = req.app.locals.geoData.districtById[parseInt(req.params.districtId)];
  if (!district) return res.status(404).json({ error: 'District not found.' });
  res.json({ success: true, data: district });
});

// GET /api/v1/districts/:districtId/subdistricts - List sub-districts
router.get('/districts/:districtId/subdistricts', (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const districtId = parseInt(req.params.districtId);
  let subdistricts = req.app.locals.geoData.subdistrictsByDistrict[districtId] || [];

  if (search) {
    const q = search.toLowerCase();
    subdistricts = subdistricts.filter(sd => sd.name.toLowerCase().includes(q));
  }

  const total = subdistricts.length;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 100);
  const paginated = subdistricts.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) }
  });
});

// GET /api/v1/subdistricts/:subdistrictId - Get sub-district by ID
router.get('/subdistricts/:subdistrictId', (req, res) => {
  const sd = req.app.locals.geoData.subdistrictById[parseInt(req.params.subdistrictId)];
  if (!sd) return res.status(404).json({ error: 'Sub-district not found.' });
  res.json({ success: true, data: sd });
});

// GET /api/v1/subdistricts/:subdistrictId/villages - List villages
router.get('/subdistricts/:subdistrictId/villages', (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const sdId = parseInt(req.params.subdistrictId);
  let villages = req.app.locals.geoData.villagesBySubdistrict[sdId] || [];

  if (search) {
    const q = search.toLowerCase();
    villages = villages.filter(v => v.name.toLowerCase().includes(q));
  }

  const total = villages.length;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 200);
  const paginated = villages.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) }
  });
});

// GET /api/v1/search - Global search/autocomplete
router.get('/search', (req, res) => {
  const { q, type, limit = 20 } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters.' });
  }

  const query = q.toLowerCase();
  const maxResults = Math.min(parseInt(limit), 50);
  const results = [];
  const data = req.app.locals.geoData;

  // Search states
  if (!type || type === 'state') {
    for (const s of data.states) {
      if (s.name.toLowerCase().includes(query)) {
        results.push({ type: 'state', id: s.id, name: s.name, code: s.code });
      }
    }
  }

  // Search districts
  if (!type || type === 'district') {
    for (const d of data.districts) {
      if (d.name.toLowerCase().includes(query)) {
        results.push({
          type: 'district', id: d.id, name: d.name,
          state: d.state_name, state_id: d.state_id
        });
        if (results.length >= maxResults) break;
      }
    }
  }

  // Search sub-districts
  if (!type || type === 'subdistrict') {
    for (const sd of data.subdistricts) {
      if (sd.name.toLowerCase().includes(query)) {
        results.push({
          type: 'subdistrict', id: sd.id, name: sd.name,
          district: sd.district_name, state: sd.state_name
        });
        if (results.length >= maxResults) break;
      }
    }
  }

  // Search villages (limit because there are 500k+)
  if (!type || type === 'village') {
    const searchIdx = data.searchIndex;
    let count = 0;
    for (let i = 0; i < searchIdx.length && count < maxResults; i++) {
      if (searchIdx[i].name.toLowerCase().includes(query)) {
        const v = searchIdx[i].data;
        results.push({
          type: 'village', id: v.id, name: v.name,
          subdistrict: v.subdistrict_name,
          district: v.district_name,
          state: v.state_name,
          full_address: `${v.name}, ${v.subdistrict_name}, ${v.district_name}, ${v.state_name}, India`
        });
        count++;
      }
    }
  }

  res.json({
    success: true,
    query: q,
    total: results.length,
    data: results.slice(0, maxResults)
  });
});

// GET /api/v1/autocomplete - Autocomplete for form dropdowns
router.get('/autocomplete', (req, res) => {
  const { q, state_id, district_id, subdistrict_id, limit = 10 } = req.query;
  if (!q || q.length < 1) {
    return res.status(400).json({ error: 'Query required.' });
  }

  const query = q.toLowerCase();
  const maxResults = Math.min(parseInt(limit), 30);
  const data = req.app.locals.geoData;
  const results = [];

  // If subdistrict_id provided, search villages within
  if (subdistrict_id) {
    const villages = data.villagesBySubdistrict[parseInt(subdistrict_id)] || [];
    for (const v of villages) {
      if (v.name.toLowerCase().startsWith(query)) {
        results.push({ id: v.id, name: v.name, code: v.code });
        if (results.length >= maxResults) break;
      }
    }
  }
  // If district_id provided, search sub-districts
  else if (district_id) {
    const sds = data.subdistrictsByDistrict[parseInt(district_id)] || [];
    for (const sd of sds) {
      if (sd.name.toLowerCase().startsWith(query)) {
        results.push({ id: sd.id, name: sd.name, code: sd.code });
        if (results.length >= maxResults) break;
      }
    }
  }
  // If state_id provided, search districts
  else if (state_id) {
    const dists = data.districtsByState[parseInt(state_id)] || [];
    for (const d of dists) {
      if (d.name.toLowerCase().startsWith(query)) {
        results.push({ id: d.id, name: d.name, code: d.code });
        if (results.length >= maxResults) break;
      }
    }
  }
  // Otherwise search states
  else {
    for (const s of data.states) {
      if (s.name.toLowerCase().startsWith(query)) {
        results.push({ id: s.id, name: s.name, code: s.code });
        if (results.length >= maxResults) break;
      }
    }
  }

  res.json({ success: true, data: results });
});

// GET /api/v1/hierarchy - Get full hierarchy path for a village
router.get('/hierarchy/:villageId', (req, res) => {
  const data = req.app.locals.geoData;
  const villageId = parseInt(req.params.villageId);
  
  // Find village in search index
  const entry = data.searchIndex.find(e => e.data.id === villageId);
  if (!entry) return res.status(404).json({ error: 'Village not found.' });

  const v = entry.data;
  res.json({
    success: true,
    data: {
      village: { id: v.id, name: v.name, code: v.code },
      subdistrict: { id: v.subdistrict_id, name: v.subdistrict_name },
      district: { id: v.district_id, name: v.district_name },
      state: { id: v.state_id, name: v.state_name },
      country: 'India',
      formatted_address: `${v.name}, ${v.subdistrict_name}, ${v.district_name}, ${v.state_name}, India`
    }
  });
});

// GET /api/v1/stats - Overall statistics
router.get('/stats', (req, res) => {
  const data = req.app.locals.geoData;
  res.json({
    success: true,
    data: {
      total_states: data.states.length,
      total_districts: data.districts.length,
      total_subdistricts: data.subdistricts.length,
      total_villages: data.totalVillages,
      coverage: 'All India (Census 2011)'
    }
  });
});

// GET /api/v1/docs - API documentation
router.get('/docs', (req, res) => {
  res.json({
    name: 'Bharat Address API v1',
    base_url: '/api/v1',
    authentication: 'API key via x-api-key header or api_key query parameter',
    endpoints: [
      { method: 'GET', path: '/states', description: 'List all states', params: 'search, page, limit' },
      { method: 'GET', path: '/states/:id', description: 'Get state details' },
      { method: 'GET', path: '/states/:id/districts', description: 'List districts in state', params: 'search, page, limit' },
      { method: 'GET', path: '/districts/:id', description: 'Get district details' },
      { method: 'GET', path: '/districts/:id/subdistricts', description: 'List sub-districts', params: 'search, page, limit' },
      { method: 'GET', path: '/subdistricts/:id', description: 'Get sub-district details' },
      { method: 'GET', path: '/subdistricts/:id/villages', description: 'List villages', params: 'search, page, limit' },
      { method: 'GET', path: '/search', description: 'Global search', params: 'q (required), type, limit' },
      { method: 'GET', path: '/autocomplete', description: 'Autocomplete for dropdowns', params: 'q, state_id, district_id, subdistrict_id, limit' },
      { method: 'GET', path: '/hierarchy/:villageId', description: 'Get full hierarchy for village' },
      { method: 'GET', path: '/stats', description: 'Dataset statistics' }
    ],
    plans: [
      { name: 'Free', daily_limit: 100 },
      { name: 'Premium', daily_limit: 1000 },
      { name: 'Pro', daily_limit: 10000 },
      { name: 'Unlimited', daily_limit: 'Unlimited' }
    ]
  });
});

module.exports = router;
