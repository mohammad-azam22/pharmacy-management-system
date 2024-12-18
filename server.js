// PHARMACY NAME: MediSync
// const pharmacyID = 'MDS1';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path")
const session = require('express-session');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// importing routes
const dashboardTabRoutes = require('./routes/dashboardTabRoutes');
const manageInventoryTabRoutes = require('./routes/manageInventoryTabRoutes');
const dispenseMedicationTabRoutes = require('./routes/dispenseMedicationTabRoutes');
const analyzeTabRoutes = require('./routes/analyzeTabRoutes');
const settingsTabRoutes = require('./routes/settingsTabRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');

app = express();
const PORT = 3000;

// MIDDLEWARE FUNCTIONS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to handle JSON data
app.use(session({
    secret: 'aS3cReT!kEy#1234$%^&*',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    else {
        res.status(401).sendFile(path.join(__dirname, 'public', 'html', 'unauthorized.html'));
    }
}

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/workspace/dashboard_tab', dashboardTabRoutes);    // dashboard tab endpoint
app.use('/workspace/manage_inventory_tab', manageInventoryTabRoutes);    // manage inventory tab endpoint
app.use('/workspace/dispense_medication_tab', dispenseMedicationTabRoutes);    // dispense medication tab endpoint
app.use('/workspace/analyze_tab', analyzeTabRoutes);    // analyze tab endpoint
app.use('/workspace/settings_tab', settingsTabRoutes);    // settings tab endpoint
app.use('/user', userRoutes);    // user endpoint
app.use('/doctor', doctorRoutes);    // doctor endpoint
app.use('/patient', patientRoutes);    // patient endpoint

// HOME ENDPOINT
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// DASHBOARD ENDPOINT
app.get('/workspace', isAuthenticated, (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
    } else {
        res.status(401).sendFile(path.join(__dirname, 'public', 'html', 'unauthorized.html'));
    }
});

// NOT FOUND ENDPOINT
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'html', 'not_found.html'));
});

// STARTING THE SERVER
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.\ngo to http://localhost:${PORT}.`));
