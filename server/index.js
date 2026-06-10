const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { PORT } = require('./config/constants');
const apiRoutes = require('./routes/api');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logging

// Routes
app.use('/api', apiRoutes);

// Root
app.get('/', (req, res) => {
    res.send('Decentralized Secure File Sharing System (Qatar Region Only) - Active');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Zero Trust Architecture: Enabled`);
    console.log(`Geo-Fencing: Active (Qatar Only)`);
    console.log(`Store: In-Memory + Simulated Nodes`);
});
