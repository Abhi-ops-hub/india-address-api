const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { getDB, saveDB } = require('../utils/db');

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(verifyAdmin);

// GET /admin/dashboard - Dashboard stats
router.get('/dashboard', (req, res) => {
  const db = getDB();
  const data = req.app.locals.geoData;
  
  const totalUsers = db.users.length;
  const totalApiKeys = db.apiKeys.length;
  const activeKeys = db.apiKeys.filter(k => k.active).length;
  const totalRequests = db.apiKeys.reduce((sum, k) => sum + (k.totalRequests || 0), 0);
  
  // Usage by plan
  const planBreakdown = {};
  for (const k of db.apiKeys) {
    planBreakdown[k.plan] = (planBreakdown[k.plan] || 0) + 1;
  }

  // Recent API keys
  const recentKeys = [...db.apiKeys]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(k => ({
      id: k.id,
      name: k.name,
      key: k.key.substring(0, 12) + '...',
      plan: k.plan,
      active: k.active,
      totalRequests: k.totalRequests || 0,
      createdAt: k.createdAt
    }));

  // Daily requests for last 7 days
  const dailyRequests = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().split('T')[0];
    dailyRequests[day] = 0;
  }
  for (const k of db.apiKeys) {
    if (k.usage) {
      for (const [day, count] of Object.entries(k.usage)) {
        if (dailyRequests.hasOwnProperty(day)) {
          dailyRequests[day] += count;
        }
      }
    }
  }

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalApiKeys,
        activeKeys,
        totalRequests,
        totalStates: data.states.length,
        totalDistricts: data.districts.length,
        totalSubdistricts: data.subdistricts.length,
        totalVillages: data.totalVillages
      },
      planBreakdown,
      recentKeys,
      dailyRequests
    }
  });
});

// GET /admin/users - List all users
router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    company: u.company,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    apiKeys: db.apiKeys.filter(k => k.userId === u.id).length
  }));
  res.json({ success: true, data: users });
});

// PUT /admin/users/:id - Update user
router.put('/users/:id', (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { active, role } = req.body;
  if (active !== undefined) user.active = active;
  if (role) user.role = role;
  saveDB();

  res.json({ success: true, data: { id: user.id, email: user.email, active: user.active, role: user.role } });
});

// GET /admin/api-keys - List all API keys
router.get('/api-keys', (req, res) => {
  const db = getDB();
  const keys = db.apiKeys.map(k => ({
    id: k.id,
    key: k.key.substring(0, 16) + '...',
    name: k.name,
    plan: k.plan,
    active: k.active,
    totalRequests: k.totalRequests || 0,
    lastUsed: k.lastUsed,
    createdAt: k.createdAt,
    userId: k.userId
  }));
  res.json({ success: true, data: keys });
});

// POST /admin/api-keys - Create new API key
router.post('/api-keys', (req, res) => {
  const { name, plan = 'free', userId } = req.body;
  const db = getDB();

  const apiKey = {
    id: uuidv4(),
    key: 'ba_' + uuidv4().replace(/-/g, '').substring(0, 28),
    secret: uuidv4(),
    userId: userId || null,
    name: name || 'New API Key',
    plan,
    active: true,
    createdAt: new Date().toISOString(),
    totalRequests: 0,
    usage: {},
    lastUsed: null
  };

  db.apiKeys.push(apiKey);
  saveDB();

  res.status(201).json({
    success: true,
    data: { id: apiKey.id, key: apiKey.key, secret: apiKey.secret, name: apiKey.name, plan: apiKey.plan }
  });
});

// PUT /admin/api-keys/:id - Update API key
router.put('/api-keys/:id', (req, res) => {
  const db = getDB();
  const key = db.apiKeys.find(k => k.id === req.params.id);
  if (!key) return res.status(404).json({ error: 'API key not found.' });

  const { active, plan, name } = req.body;
  if (active !== undefined) key.active = active;
  if (plan) key.plan = plan;
  if (name) key.name = name;
  saveDB();

  res.json({ success: true, data: { id: key.id, active: key.active, plan: key.plan, name: key.name } });
});

// DELETE /admin/api-keys/:id - Delete API key
router.delete('/api-keys/:id', (req, res) => {
  const db = getDB();
  const idx = db.apiKeys.findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'API key not found.' });
  db.apiKeys.splice(idx, 1);
  saveDB();
  res.json({ success: true });
});

// GET /admin/analytics - Analytics data
router.get('/analytics', (req, res) => {
  const db = getDB();
  
  const topKeys = [...db.apiKeys]
    .sort((a, b) => (b.totalRequests || 0) - (a.totalRequests || 0))
    .slice(0, 10)
    .map(k => ({
      name: k.name,
      key: k.key.substring(0, 12) + '...',
      plan: k.plan,
      totalRequests: k.totalRequests || 0
    }));

  // Aggregate daily data
  const dailyData = {};
  for (const k of db.apiKeys) {
    if (k.usage) {
      for (const [day, count] of Object.entries(k.usage)) {
        dailyData[day] = (dailyData[day] || 0) + count;
      }
    }
  }

  res.json({
    success: true,
    data: {
      topKeys,
      dailyData,
      totalRequests: db.apiKeys.reduce((s, k) => s + (k.totalRequests || 0), 0)
    }
  });
});

module.exports = router;
