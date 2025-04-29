// server.js - Backend for TimeBridge
const express = require('express');
// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const axios = require('axios'); // For making HTTP requests to WeatherAPI
const cors = require('cors'); // Add CORS middleware
const { createClient } = require('@supabase/supabase-js');
const { sendMeetingConfirmationEmail } = require('./js/components/email.js');

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1';

// Check for essential environment variables
if (!SUPABASE_URL || !SUPABASE_KEY || !WEATHER_API_KEY) {
    console.error("Error: Missing required environment variables (SUPABASE_URL, SUPABASE_KEY, WEATHER_API_KEY).");
    console.error("Please create a .env file with these values.");
    process.exit(1); // Exit if configuration is missing
}

// --- Initialization ---
const app = express();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '.'))); // Serve static files (HTML, CSS, JS) from the root directory

// --- Helper Functions ---

/**
 * Validates if a string is a valid IPv4 or IPv6 address.
 * @param {string} ip - The IP address string.
 * @returns {boolean}
 */
function isValidIPAddress(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Basic IPv6 regex (adjust if more specific validation is needed)
    const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Gets the client's IP address from the request headers or connection.
 * Handles proxies and IPv6-mapped IPv4 addresses.
 * @param {import('express').Request} req - The Express request object.
 * @returns {string} - The client's IP address.
 */
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',').shift() : req.socket?.remoteAddress;
    return ip ? ip.replace(/^::ffff:/, '') : '127.0.0.1'; // Fallback
}

// --- API Routes ---

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// == Weather API Endpoints ==

// Get current weather
app.get('/api/weather/current', async (req, res) => {
    try {
        // Use specific query param 'q' if provided, otherwise detect IP
        let locationQuery = req.query.q;
        if (!locationQuery) {
            const clientIp = getClientIp(req);
            // Use "auto:ip" for WeatherAPI to automatically detect location based on IP
            locationQuery = isValidIPAddress(clientIp) ? clientIp : "auto:ip";
        }
        
        console.log(`Fetching current weather for query: ${locationQuery}`);
        
        const response = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
            params: {
                key: WEATHER_API_KEY,
                q: locationQuery,
                aqi: 'no' // Optionally exclude air quality data
            }
        });
        
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || 'Error fetching current weather data';
        console.error(`Weather API Error (${status}): ${message}`, error.config?.params);
        res.status(status).json({ error: { message, code: error.response?.data?.error?.code } });
    }
});

// Get weather forecast
app.get('/api/weather/forecast', async (req, res) => {
    try {
        let locationQuery = req.query.q;
        const days = req.query.days || 1; // Default to 1 day forecast

        if (!locationQuery) {
            const clientIp = getClientIp(req);
            locationQuery = isValidIPAddress(clientIp) ? clientIp : "auto:ip";
        }
        
        console.log(`Fetching ${days}-day forecast for query: ${locationQuery}`);

        const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
            params: {
                key: WEATHER_API_KEY,
                q: locationQuery,
                days: days,
                aqi: 'no',
                alerts: 'no'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || 'Error fetching weather forecast';
        console.error(`Weather API Error (${status}): ${message}`, error.config?.params);
        res.status(status).json({ error: { message, code: error.response?.data?.error?.code } });
    }
});

// Meeting confirmation email API
app.post('/api/send-meeting-confirmation', async (req, res) => {
    const { to, subject, html } = req.body;
  
    try {
      const emailResponse = await sendMeetingConfirmationEmail({ to, subject, html });
      res.status(200).json({ success: true, message: 'Email sent', response: emailResponse });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
  });
  

// == Meetings API Endpoints (interacting with Supabase) ==

// GET all meetings
app.get('/api/meetings', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Meetings').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Supabase Error (GET /api/meetings):', error.message);
        res.status(500).json({ error: { message: 'Error fetching meetings' } });
    }
});

// POST a new meeting
app.post('/api/meetings', async (req, res) => {
    try {
        // Basic validation (can be expanded)
        const requiredFields = ['title', 'start', 'end', 'requesterName', 'requesterEmail'];
        if (!requiredFields.every(field => req.body[field])) {
            return res.status(400).json({ error: { message: 'Missing required meeting fields' } });
        }

        // Ensure status and color are set if not provided
        const meetingData = {
            ...req.body,
            status: req.body.status || 'pending', // Default status
            color: req.body.color || '#f59e0b' // Default color (Tailwind orange-500)
            // Handle attendees array if needed: attendees: req.body.attendees || []
        };

        const { data, error } = await supabase
            .from('Meetings')
            .insert(meetingData)
            .select(); // Return the created record
            
        if (error) throw error;
        
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Supabase Error (POST /api/meetings):', error.message);
        res.status(500).json({ error: { message: 'Error creating meeting' } });
    }
});

// PUT (update) an existing meeting
app.put('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: { message: 'Invalid meeting ID' } });
        }

        // Optionally, update color based on status
        const updates = { ...req.body };
        if (updates.status === 'approved') {
            updates.color = '#10b981'; // Tailwind green-500
        } else if (updates.status === 'canceled') {
            updates.color = '#ef4444'; // Tailwind red-500
        }

        const { data, error } = await supabase
            .from('Meetings')
            .update(updates)
            .eq('id', id)
            .select(); // Return the updated record
            
        if (error) throw error;
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: { message: 'Meeting not found' } });
        }
        
        res.json(data[0]);
    } catch (error) {
        console.error(`Supabase Error (PUT /api/meetings/${req.params.id}):`, error.message);
        res.status(500).json({ error: { message: 'Error updating meeting' } });
    }
});

app.get('/schedule/:slug', (req, res) => {
  // always serve the booking.html shell
  res.sendFile(path.join(__dirname, 'booking.html'))
})

// --- HTML Serving (Catch-all for SPA or direct file access) ---

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dashboard.html
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve booking.html
app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

// Serve other HTML files directly if requested (using named parameters instead of wildcards)
app.get('/:page.html', (req, res) => {
    const filePath = path.join(__dirname, `${req.params.page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file doesn't exist, send 404
            res.status(404).send('File not found');
        }
    });
});

// Handle 404 for API routes not found - Using a regular middleware instead of a route with a wildcard
app.use((req, res, next) => {
    // Check if the request is for an API endpoint
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: { message: 'API endpoint not found' } });
    }
    // Continue to next middleware for non-API routes
    next();
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Supabase URL configured: ${SUPABASE_URL.substring(0, 20)}...`);
    console.log(`Weather API Key configured: ${WEATHER_API_KEY ? 'Yes' : 'No'}`);
});
