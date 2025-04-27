const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/api-page', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Settings
const settingsPath = path.join(__dirname, 'src', 'settings.json');
let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} catch (err) {
  console.error('Error reading settings.json:', err.message);
}

// Maintenance Mode
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

// 404 Not Found
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// === FINAL ===
// Tidak pakai app.listen() di Vercel!
// Cukup export app:
module.exports = app;
