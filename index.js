const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('./function.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Files
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Load settings.json
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey || [];

// Maintenance Mode Middleware
app.use((req, res, next) => {
  if (settings.maintenance && req.path !== '/maintenance.html') {
    return res.redirect('/maintenance.html');
  }
  next();
});

// Auto-load API routes
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder);
  if (fs.statSync(subfolderPath).isDirectory()) {
    fs.readdirSync(subfolderPath).forEach((file) => {
      const filePath = path.join(subfolderPath, file);
      if (path.extname(file) === '.js') {
        require(filePath)(app);
      }
    });
  }
});

// Default Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// 404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// Export App (important for Vercel)
module.exports = app;
