const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const portalRoutes = require('./routes/portal');

// Import middleware
const { loadData } = require('./middleware/dataLoader');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Load data into memory
loadData(app);

// Routes
app.use('/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/portal', portalRoutes);

// Health check
app.get('/health', (req, res) => {
  const data = req.app.locals.geoData;
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    data: {
      states: data ? data.states.length : 0,
      districts: data ? data.districts.length : 0,
      subdistricts: data ? data.subdistricts.length : 0,
      villages: data ? data.totalVillages : 0
    }
  });
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'Bharat Address API',
    version: '1.0.0',
    description: 'Comprehensive REST API for India\'s village-level geographical data',
    endpoints: {
      health: '/health',
      auth: '/auth',
      api: '/api/v1',
      admin: '/admin',
      portal: '/portal',
      docs: '/api/v1/docs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Bharat Address API Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/health`);
  console.log(`   API:        http://localhost:${PORT}/api/v1`);
  console.log(`   Admin:      http://localhost:${PORT}/admin`);
  console.log(`   Portal:     http://localhost:${PORT}/portal\n`);
});
