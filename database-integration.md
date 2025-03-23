# Database Integration Guide for TimeBridge

This guide explains how to integrate TimeBridge with a database to store and retrieve meeting and user data.

## Database Schema

Here's a recommended database schema for the TimeBridge application:

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  /* For stored passwords (hashed) */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meetings Table
```sql
CREATE TABLE meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  host_id INTEGER NOT NULL,
  requester_name VARCHAR(100) NOT NULL,
  requester_email VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', /* 'pending', 'approved', 'canceled' */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id)
);
```

### Availability Table (Optional)
```sql
CREATE TABLE availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, /* 0-6 (Sunday to Saturday) */
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Integration Options

### 1. Simple JSON File Storage

For small applications or prototyping, you can use JSON files to store data:

```javascript
// Example implementation in app.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const MEETINGS_FILE = path.join(DB_PATH, 'meetings.json');

// Ensure the data directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(MEETINGS_FILE)) {
    fs.writeFileSync(MEETINGS_FILE, JSON.stringify([]));
}

// Database methods
const db = {
    // Get all users
    getUsers: () => {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    },
    
    // Get user by ID
    getUserById: (id) => {
        const users = db.getUsers();
        return users.find(user => user.id === id);
    },
    
    // Create new user
    createUser: (user) => {
        const users = db.getUsers();
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return newUser;
    },
    
    // Similar methods for meetings...
    getMeetings: () => {
        const data = fs.readFileSync(MEETINGS_FILE, 'utf8');
        return JSON.parse(data);
    },
    
    getMeetingById: (id) => {
        const meetings = db.getMeetings();
        return meetings.find(meeting => meeting.id === id);
    },
    
    createMeeting: (meeting) => {
        const meetings = db.getMeetings();
        const newId = meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1;
        
        const newMeeting = {
            id: newId,
            ...meeting,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        meetings.push(newMeeting);
        fs.writeFileSync(MEETINGS_FILE, JSON.stringify(meetings, null, 2));
        return newMeeting;
    },
    
    updateMeeting: (id, updates) => {
        const meetings = db.getMeetings();
        const index = meetings.findIndex(m => m.id === id);
        
        if (index !== -1) {
            meetings[index] = {
                ...meetings[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            
            fs.writeFileSync(MEETINGS_FILE, JSON.stringify(meetings, null, 2));
            return meetings[index];
        }
        
        return null;
    }
};

module.exports = db;
```

### 2. SQLite Integration

For a lightweight SQL database that doesn't require a separate server:

```javascript
// Example with better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'), { verbose: console.log });

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        host_id INTEGER NOT NULL,
        requester_name TEXT NOT NULL,
        requester_email TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users(id)
    );
`);

// Database methods
const dbMethods = {
    // User methods
    createUser: (user) => {
        const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
        const result = stmt.run(user.name, user.email, user.password_hash);
        return { id: result.lastInsertRowid, ...user };
    },
    
    getUserById: (id) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },
    
    getUserByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },
    
    // Meeting methods
    createMeeting: (meeting) => {
        const stmt = db.prepare(`
            INSERT INTO meetings (title, start_time, end_time, host_id, requester_name, requester_email, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            meeting.title,
            meeting.start_time,
            meeting.end_time,
            meeting.host_id,
            meeting.requester_name,
            meeting.requester_email,
            meeting.description || '',
            meeting.status || 'pending'
        );
        
        return { id: result.lastInsertRowid, ...meeting };
    },
    
    getMeetingById: (id) => {
        const stmt = db.prepare('SELECT * FROM meetings WHERE id = ?');
        return stmt.get(id);
    },
    
    updateMeetingStatus: (id, status) => {
        const stmt = db.prepare('UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const result = stmt.run(status, id);
        return result.changes > 0;
    },
    
    getUpcomingMeetingsByHostId: (hostId) => {
        const stmt = db.prepare(`
            SELECT * FROM meetings 
            WHERE host_id = ? AND start_time >= datetime('now') AND status != 'canceled'
            ORDER BY start_time ASC
        `);
        return stmt.all(hostId);
    }
};

module.exports = dbMethods;
```

### 3. MySQL/PostgreSQL Integration

For production applications, using a full-featured SQL database is recommended:

```javascript
// Example with MySQL
const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'TimeBridge',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database methods
const db = {
    // User methods
    createUser: async (user) => {
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [user.name, user.email, user.password_hash]
        );
        return { id: result.insertId, ...user };
    },
    
    getUserById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    
    getUserByEmail: async (email) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    
    // Meeting methods
    createMeeting: async (meeting) => {
        const [result] = await pool.execute(
            `INSERT INTO meetings 
             (title, start_time, end_time, host_id, requester_name, requester_email, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                meeting.title,
                meeting.start_time,
                meeting.end_time,
                meeting.host_id,
                meeting.requester_name,
                meeting.requester_email,
                meeting.description || '',
                meeting.status || 'pending'
            ]
        );
        return { id: result.insertId, ...meeting };
    },
    
    getMeetingById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
        return rows[0];
    },
    
    updateMeetingStatus: async (id, status) => {
        const [result] = await pool.execute(
            'UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    },
    
    getUpcomingMeetingsByHostId: async (hostId) => {
        const [rows] = await pool.execute(
            `SELECT * FROM meetings 
             WHERE host_id = ? AND start_time >= NOW() AND status != 'canceled'
             ORDER BY start_time ASC`,
            [hostId]
        );
        return rows;
    }
};

module.exports = db;
```

## Connecting the Frontend to the Database

To connect your HTML/JavaScript frontend to the database, you'll need to create an API layer. Here's how to modify the current code to work with an API:

### 1. Update the mockDatabase object in app.js

Replace the mockDatabase with API calls:

```javascript
// In app.js, replace mockDatabase with API functions

const api = {
    // Get upcoming meetings
    getUpcomingMeetings: async () => {
        try {
            const response = await fetch('/api/meetings/upcoming');
            if (!response.ok) throw new Error('Failed to fetch meetings');
            return await response.json();
        } catch (error) {
            console.error('Error fetching meetings:', error);
            return [];
        }
    },
    
    // Update meeting status
    updateMeeting: async (id, updates) => {
        try {
            const response = await fetch(`/api/meetings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) throw new Error('Failed to update meeting');
            return await response.json();
        } catch (error) {
            console.error('Error updating meeting:', error);
            return null;
        }
    },
    
    // Create a new meeting
    createMeeting: async (meeting) => {
        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(meeting)
            });
            
            if (!response.ok) throw new Error('Failed to create meeting');
            return await response.json();
        } catch (error) {
            console.error('Error creating meeting:', error);
            return null;
        }
    }
};

// Then modify your functions to use async/await with the API
async function loadUpcomingMeetings() {
    const meetingsList = document.getElementById('upcoming-meetings-list');
    if (!meetingsList) return;
    
    const upcomingMeetings = await api.getUpcomingMeetings();
    
    // Continue with the existing rendering logic...
}

// Similar changes for other functions that interact with the database
```

## Email Notifications

To implement real email notifications, you can use a service like SendGrid, Mailgun, or AWS SES:

```javascript
// Example with Nodemailer and SendGrid
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sgTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

const sendMeetingConfirmationEmail = async (meeting) => {
    try {
        await transporter.sendMail({
            from: 'noreply@TimeBridge.com',
            to: meeting.requester_email,
            subject: `Meeting ${meeting.status}: ${meeting.title}`,
            html: `
                <h2>Your meeting has been ${meeting.status}</h2>
                <p><strong>Title:</strong> ${meeting.title}</p>
                <p><strong>Date:</strong> ${new Date(meeting.start_time).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(meeting.start_time).toLocaleTimeString()} - ${new Date(meeting.end_time).toLocaleTimeString()}</p>
                <p><strong>Description:</strong> ${meeting.description || 'No description provided'}</p>
                <p>Thank you for using TimeBridge!</p>
            `
        });
        
        console.log(`Email sent to ${meeting.requester_email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendMeetingConfirmationEmail };
```

## Conclusion

This guide provides the basics for integrating the TimeBridge application with different database options. Choose the approach that best fits your project's scale and requirements.

For a production environment, consider additional factors like:
- Authentication and authorization
- Input validation and security measures
- Error handling and logging
- Database migrations and backups
- API rate limiting
- HTTPS/SSL encryption 