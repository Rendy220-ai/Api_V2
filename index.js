const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static files
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Global settings
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;

// Maintenance Mode Cek
app.get('/', (req, res) => {
    const settingsNow = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    if (settingsNow.maintenance) {
        return res.sendFile(path.join(__dirname, 'api-page', 'maintenance.html'));
    } else {
        return res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
    }
});

// Dynamic API Loader
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');

if (fs.existsSync(apiFolder)) {
    fs.readdirSync(apiFolder).forEach((subfolder) => {
        const subfolderPath = path.join(apiFolder, subfolder);
        if (fs.statSync(subfolderPath).isDirectory()) {
            fs.readdirSync(subfolderPath).forEach((file) => {
                const filePath = path.join(subfolderPath, file);
                if (path.extname(file) === '.js') {
                    require(filePath)(app);
                    totalRoutes++;
                    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
                }
            });
        }
    });
}

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

// Error Handling 404
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// Error Handling 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// Server Listening
app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
