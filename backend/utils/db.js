const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

let db = null;

function initDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      db = createDefaultDB();
    }
  } else {
    db = createDefaultDB();
  }
  return db;
}

function createDefaultDB() {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  const defaultDB = {
    users: [
      {
        id: uuidv4(),
        email: 'admin@bharatapi.com',
        password: bcrypt.hashSync('admin123', 10),
        name: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
        active: true
      }
    ],
    apiKeys: [
      {
        id: uuidv4(),
        key: 'ba_demo_' + uuidv4().replace(/-/g, '').substring(0, 24),
        secret: uuidv4(),
        userId: null,
        name: 'Demo Key',
        plan: 'free',
        active: true,
        createdAt: new Date().toISOString(),
        totalRequests: 0,
        usage: {},
        lastUsed: null
      }
    ],
    analytics: {
      totalRequests: 0,
      requestsByEndpoint: {},
      requestsByDay: {}
    }
  };

  saveDB(defaultDB);
  return defaultDB;
}

function getDB() {
  if (!db) initDB();
  return db;
}

function saveDB(data) {
  if (data) db = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Auto-save every 30 seconds
setInterval(() => {
  if (db) saveDB();
}, 30000);

module.exports = { getDB, saveDB, initDB };
