const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); 
const sgMail = require('@sendgrid/mail')
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; 
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY; 
sgMail.setApiKey(process.env.EMAIL_API_KEY) 

if (!SUPABASE_URL || !SUPABASE_KEY || !WEATHER_API_KEY) {
    console.error("Error: Missing required environment variables (SUPABASE_URL, SUPABASE_KEY, WEATHER_API_KEY).");
    console.error("Please create a .env file with these values.");
    process.exit(1); 
}

const app = express();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '.'))); 

function isValidIPAddress(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',').shift() : req.socket?.remoteAddress;
    return ip ? ip.replace(/^::ffff:/, '') : '127.0.0.1'; // Fallback
}


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const ai = new GoogleGenAI({apiKey: GOOGLE_AI_API_KEY})
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }
  
    try {
      const response = await ai.models.generateContent({
        model:    'gemini-2.0-flash',
        contents: prompt,
      });
      return res.json({ text: response.text });
    } catch (err) {
      console.error('Gemini error:', err);
      return res.status(500).json({ error: 'Generation failed' });
    }
  });



app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const recipients = Array.isArray(email)
    ? email
    : String(email)
        .split(/[,;\s]+/)
        .map(e => e.trim())
        .filter(e => e);

  const msg = {
    to:      recipients,
    from:    'ha504@scarletmail.rutgers.edu',
    subject: `New message from ${name}`,
    text:    message,
    html:    `<p>${message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    await sgMail.send(msg);
    return res.json({ ok: true });
  } catch (err) {
    console.error(
      'SendGrid error response body:',
      JSON.stringify(err.response?.body, null, 2)
    );
  }
});

app.get('/api/autocomplete', async (req, res) => {
    const { input } = req.query;
    if (!input) return res.status(400).json({ error: 'Missing input' });
  
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input,
            key: GOOGLE_API_KEY,
          }
        }
      );
      res.json(response.data);
    } catch (err) {
      console.error('Places API error:', err.response?.data || err);
      res.status(500).json({ error: 'Autocomplete failed' });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });


app.get('/api/weather/current', async (req, res) => {
    try {
        let locationQuery = req.query.q;
        if (!locationQuery) {
            const clientIp = getClientIp(req);
            locationQuery = isValidIPAddress(clientIp) ? clientIp : "auto:ip";
        }
        
        console.log(`Fetching current weather for query: ${locationQuery}`);
        
        const response = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
            params: {
                key: WEATHER_API_KEY,
                q: locationQuery,
                aqi: 'no'
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

app.get('/api/weather/forecast', async (req, res) => {
    try {
        let locationQuery = req.query.q;
        const days = req.query.days || 1;

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


app.get('/schedule/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'booking.html'))
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/:page.html', (req, res) => {
    const filePath = path.join(__dirname, `${req.params.page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: { message: 'API endpoint not found' } });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Supabase URL configured: ${SUPABASE_URL.substring(0, 20)}...`);
    console.log(`Weather API Key configured: ${WEATHER_API_KEY ? 'Yes' : 'No'}`);
});
