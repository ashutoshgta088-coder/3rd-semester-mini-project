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

// ─── Serve Web App (public/index.html) ───────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, '../public');
app.use(express.static(PUBLIC_DIR));

// Root route: serve web app or fallback info
app.get('/', (req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; text-align: center;">
      <h1 style="color: #4f46e5; font-size: 2.5rem;">🎓 stuatten</h1>
      <p style="color: #6b7280;">Smart Biometric Attendance System (AKTU Compatible)</p>
      <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 12px; font-family: monospace; margin-top: 1.5rem; text-align: left;">
        <p>✅ <strong>API Server Status:</strong> ONLINE</p>
        <p>📍 <strong>Health Check:</strong> <a href="/api/health">/api/health</a></p>
        <p>🔐 <strong>Login Endpoint:</strong> POST /api/auth/login</p>
        <p>📊 <strong>Version:</strong> 1.0.0</p>
      </div>
      <p style="margin-top: 1rem; color: #9ca3af; font-size: 0.9rem;">
        Run <code>npx expo start --web</code> to launch the React Native web app.
      </p>
    </div>
  `);
});

// SPA catch-all — must come AFTER API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
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
