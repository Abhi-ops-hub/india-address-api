const jwt = require('jsonwebtoken');
const { getDB } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat-address-api-secret-key-2024';

// Verify JWT token for admin routes
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Verify admin role
function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

// Verify API key for public API routes
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  // Also check for JWT token as fallback (for data explorer)
  const authHeader = req.headers.authorization;
  
  if (!apiKey && !authHeader) {
    return res.status(401).json({ 
      error: 'API key required. Include x-api-key header or api_key query parameter.' 
    });
  }

  const db = getDB();
  let keyEntry;
  
  // Try API key first
  if (apiKey) {
    keyEntry = db.apiKeys.find(k => k.key === apiKey && k.active);
    // For demo/explorer keys, use the first available key
    if (!keyEntry && (apiKey === 'demo' || apiKey === 'explorer_demo')) {
      keyEntry = db.apiKeys.find(k => k.active);
    }
  }
  
  // Fallback: if JWT token present, use user's first key or create a temp session
  if (!keyEntry && authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      keyEntry = db.apiKeys.find(k => k.userId === decoded.id && k.active);
      if (!keyEntry) {
        // Use any active key for authenticated users
        keyEntry = db.apiKeys.find(k => k.active);
      }
    } catch (e) {
      // Token invalid, continue
    }
  }
  
  if (!keyEntry) {
    return res.status(401).json({ error: 'Invalid or inactive API key.' });
  }

  // Check rate limits based on plan
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  if (!keyEntry.usage) keyEntry.usage = {};
  if (!keyEntry.usage[today]) keyEntry.usage[today] = 0;
  
  const planLimits = {
    free: 100,
    premium: 1000,
    pro: 10000,
    unlimited: Infinity
  };
  
  const limit = planLimits[keyEntry.plan] || 100;
  
  if (keyEntry.usage[today] >= limit) {
    return res.status(429).json({ 
      error: 'Daily API limit exceeded.',
      plan: keyEntry.plan,
      limit: limit,
      used: keyEntry.usage[today]
    });
  }

  keyEntry.usage[today]++;
  keyEntry.totalRequests = (keyEntry.totalRequests || 0) + 1;
  keyEntry.lastUsed = now.toISOString();
  
  req.apiKey = keyEntry;
  next();
}

module.exports = { verifyToken, verifyAdmin, verifyApiKey, JWT_SECRET };
