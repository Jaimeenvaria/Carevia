// backend/server.js — Patientra Health API Server
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// Route Handlers
app.use('/api/auth', require('./routes/authRoutes'));                       // Authentication routes
app.use('/api/appointments', require('./routes/appointmentRoutes'));       // Appointment management routes
app.use('/api/admin', require('./routes/adminRoutes'));                     // Admin management routes
app.use('/api/search', require('./routes/searchRoutes'));                   // Doctor search routes
app.use('/api/ai', require('./routes/aiRoutes'));                           // AI agent routes
app.use('/api/health-metrics', require('./routes/healthMetricRoutes'));     // Health monitoring routes
app.use('/api/patient-profile', require('./routes/patientProfileRoutes')); // Patient profile routes
app.use('/api/notifications', require('./routes/notificationRoutes'));     // Notification routes
app.use('/api/analytics', require('./routes/analyticsRoutes'));             // Analytics routes
app.use('/api/fhir', require('./routes/fhirRoutes'));                       // FHIR-ready integration routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', platform: 'Patientra Health', version: '2.0.0' });
});

// Handle 404 errors (route not found)
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Patientra Health API running on http://localhost:${PORT}`));
