const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Must be before routes
// Allow all origins in development (or specify your exact frontend URL)
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));

// Disable caching for API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${new Date().toISOString()}]`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'none'}`);
  console.log(`Authorization: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`${'='.repeat(60)}\n`);
  next();
});

// Handle preflight requests
app.options('*', cors());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server Running',
    version: '1.0.0',
    endpoints: {
      teacher: '/api/teacher',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ============================================
// IMPORT ROUTES
// ============================================
let teacherRoutes;
try {
  teacherRoutes = require('./routes/teachers.routes');
  console.log('✅ Teacher routes loaded successfully');
} catch (err) {
  console.error('❌ Failed to load teacher routes:', err.message);
  process.exit(1);
}
// Add other routes here as needed
// const authRoutes = require('./routes/auth.routes');
// const studentRoutes = require('./routes/students.routes');
// const adminRoutes = require('./routes/admin.routes');

// ============================================
// REGISTER ROUTES (Must be BEFORE 404 handler)
// ============================================
app.use('/api/teacher', teacherRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/student', studentRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler (Must be AFTER all routes)
app.use((req, res) => {
  console.error(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.url,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'GET /api/teacher/schedule',
      'GET /api/teacher/today-sessions',
      'GET /api/teacher/seance/:seanceId/students',
      'POST /api/teacher/seance/:seanceId/attendance',
      'GET /api/teacher/statistics',
      'GET /api/teacher/at-risk-students'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Available routes:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/teacher/schedule`);
  console.log(`   - GET  /api/teacher/today-sessions`);
  console.log(`   - GET  /api/teacher/seance/:seanceId/students`);
  console.log(`   - POST /api/teacher/seance/:seanceId/attendance`);
  console.log(`   - GET  /api/teacher/statistics`);
  console.log(`   - GET  /api/teacher/at-risk-students`);
  console.log('='.repeat(60));
  
  // Test database connection
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected successfully\n');
    }
  });
});