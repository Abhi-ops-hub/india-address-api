const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB, saveDB } = require('../utils/db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const db = getDB();
  const user = db.users.find(u => u.email === email && u.active);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// POST /auth/register (B2B self-registration)
router.post('/register', (req, res) => {
  const { email, password, name, company } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  const db = getDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const user = {
    id: uuidv4(),
    email,
    password: bcrypt.hashSync(password, 10),
    name,
    company: company || '',
    role: 'user',
    createdAt: new Date().toISOString(),
    active: true
  };

  // Auto-generate a free API key
  const apiKey = {
    id: uuidv4(),
    key: 'ba_' + uuidv4().replace(/-/g, '').substring(0, 28),
    secret: uuidv4(),
    userId: user.id,
    name: `${name}'s API Key`,
    plan: 'free',
    active: true,
    createdAt: new Date().toISOString(),
    totalRequests: 0,
    usage: {},
    lastUsed: null
  };

  db.users.push(user);
  db.apiKeys.push(apiKey);
  saveDB();

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    apiKey: { key: apiKey.key, secret: apiKey.secret, plan: apiKey.plan }
  });
});

// GET /auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token.' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company }
    });
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;
