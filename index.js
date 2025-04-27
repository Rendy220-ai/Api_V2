const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Setup express app
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/api-page', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Load settings
let settings = {};
const settingsPath = path.join(__dirname, 'src', 'settings.json');
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} catch (err) {
  console.error('Error loading settings.json:', err.message);
  settings.maintenance = false;
}

// Maintenance Middleware
app.use((req, res, next) => {
  if (settings.maintenance) {
    return res.sendFile(path.join(__dirname, 'api-page', 'maintenance.html'));
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'dashboard.html'));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// === ini WAJIB!!! ===
// Export function handler untuk Vercel
const serverless = require('serverless-http');
module.exports = serverless(app);
