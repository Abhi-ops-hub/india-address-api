const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');
const { getDB, saveDB } = require('../utils/db');

// All portal routes require authentication (user or admin)
router.use(verifyToken);

// GET /portal/dashboard - B2B user dashboard
router.get('/dashboard', (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  
  const userKeys = db.apiKeys.filter(k => k.userId === userId);
  const totalRequests = userKeys.reduce((s, k) => s + (k.totalRequests || 0), 0);
  
  // Today's usage
  const today = new Date().toISOString().split('T')[0];
  const todayUsage = userKeys.reduce((s, k) => s + ((k.usage && k.usage[today]) || 0), 0);
  
  // Daily usage chart (last 7 days)
  const dailyUsage = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().split('T')[0];
    dailyUsage[day] = 0;
  }
  for (const k of userKeys) {
    if (k.usage) {
      for (const [day, count] of Object.entries(k.usage)) {
        if (dailyUsage.hasOwnProperty(day)) {
          dailyUsage[day] += count;
        }
      }
    }
  }

  res.json({
    success: true,
    data: {
      totalKeys: userKeys.length,
      activeKeys: userKeys.filter(k => k.active).length,
      totalRequests,
      todayUsage,
      dailyUsage,
      keys: userKeys.map(k => ({
        id: k.id,
        key: k.key,
        name: k.name,
        plan: k.plan,
        active: k.active,
        totalRequests: k.totalRequests || 0,
        lastUsed: k.lastUsed,
        createdAt: k.createdAt
      }))
    }
  });
});

// POST /portal/api-keys - Generate new API key
router.post('/api-keys', (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const { name } = req.body;
  
  // Limit keys per user
  const existingKeys = db.apiKeys.filter(k => k.userId === userId);
  if (existingKeys.length >= 5) {
    return res.status(400).json({ error: 'Maximum 5 API keys per user.' });
  }

  const apiKey = {
    id: uuidv4(),
    key: 'ba_' + uuidv4().replace(/-/g, '').substring(0, 28),
    secret: uuidv4(),
    userId,
    name: name || `API Key ${existingKeys.length + 1}`,
    plan: 'free',
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

// PUT /portal/api-keys/:id - Update key name
router.put('/api-keys/:id', (req, res) => {
  const db = getDB();
  const key = db.apiKeys.find(k => k.id === req.params.id && k.userId === req.user.id);
  if (!key) return res.status(404).json({ error: 'API key not found.' });

  if (req.body.name) key.name = req.body.name;
  if (req.body.active !== undefined) key.active = req.body.active;
  saveDB();

  res.json({ success: true, data: { id: key.id, name: key.name, active: key.active } });
});

// DELETE /portal/api-keys/:id - Delete key
router.delete('/api-keys/:id', (req, res) => {
  const db = getDB();
  const idx = db.apiKeys.findIndex(k => k.id === req.params.id && k.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'API key not found.' });
  db.apiKeys.splice(idx, 1);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
