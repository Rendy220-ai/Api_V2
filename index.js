const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require("./function.js"); // kalau kamu ada fungsi tambahan

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file (frontend)
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Load settings
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;

// Logging request
app.use((req, res, next) => {
    console.log(chalk.bgHex('#FFFF99').hex('#333')(` Request: ${req.method} ${req.path} `));
    global.totalreq = (global.totalreq || 0) + 1;
    next();
});

// Auto response format
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (typeof data === 'object' && data !== null) {
            const responseData = {
                status: data.status ?? true,
                creator: settings.apiSettings.creator || "FR3 Now",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Load all API routes
const apiFolder = path.join(__dirname, './src/api');
let totalRoutes = 0;

fs.readdirSync(apiFolder).forEach(sub => {
    const subPath = path.join(apiFolder, sub);
    if (fs.statSync(subPath).isDirectory()) {
        fs.readdirSync(subPath).forEach(file => {
            if (file.endsWith('.js')) {
                require(path.join(subPath, file))(app);
                totalRoutes++;
                console.log(chalk.bgHex('#90EE90').hex('#333')(` Loaded: ${file} `));
            }
        });
    }
});

console.log(chalk.bgHex('#90EE90').hex('#333')(` Total Routes Loaded: ${totalRoutes} `));

// Fallback HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333')(` Server running on port ${PORT} `));
});

module.exports = app;
