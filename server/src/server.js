require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middlewares ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// ─── Mount API Routes ─────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Serve Static Files ───────────────────────────────────────────────────────
// Priority 1: Vite React frontend dist (frontend/dist/)
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
// Priority 2: Legacy public dir (server/public/)
const PUBLIC_DIR = path.join(__dirname, '../public');

// Serve whichever static dir exists (prefer frontend/dist)
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  console.log('📦 Serving React frontend from frontend/dist/');
} else {
  app.use(express.static(PUBLIC_DIR));
  console.log('📦 Serving legacy HTML from server/public/');
}

// Root route: serve app or fallback info
app.get('/', (req, res) => {
  // Try React dist index first
  const reactIndex = path.join(FRONTEND_DIST, 'index.html');
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  // Fallback: legacy standalone HTML
  const publicIndex = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; text-align: center;">
      <h1 style="color: #4f46e5; font-size: 2.5rem;">🎓 Stuatten</h1>
      <p style="color: #6b7280;">Bluetooth-Based Smart Attendance System</p>
      <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 12px; font-family: monospace; margin-top: 1.5rem; text-align: left;">
        <p>✅ <strong>API Server Status:</strong> ONLINE</p>
        <p>📍 <strong>Health Check:</strong> <a href="/api/health">/api/health</a></p>
        <p>🔐 <strong>Login Endpoint:</strong> POST /api/auth/login</p>
        <p>📊 <strong>Version:</strong> 2.0.0</p>
      </div>
    </div>
  `);
});

// SPA catch-all — must come AFTER API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  // Try React dist index first
  const reactIndex = path.join(FRONTEND_DIST, 'index.html');
  if (fs.existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }
  // Fallback: legacy HTML
  const publicIndex = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  next();
});

// ─── Start Server ─────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const nets = os.networkInterfaces();
    let localIP = 'localhost';
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) { localIP = net.address; break; }
      }
    }
    console.log(`===================================================`);
    console.log(`🚀 stuatten Server running on port ${PORT}`);
    console.log(`🌐 Web App:  http://localhost:${PORT}`);
    console.log(`📱 Network:  http://${localIP}:${PORT}`);
    console.log(`📡 API:      http://localhost:${PORT}/api`);
    console.log(`❤️  Health:   http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
    console.log(`\n✅ Open http://localhost:${PORT} in Chrome, Edge, or Firefox\n`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
