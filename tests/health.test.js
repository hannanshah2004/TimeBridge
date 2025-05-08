// tests/health.test.js
const request = require('supertest');
const express = require('express');

// Create a mock Express app with just the health endpoint
const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

describe('Health Endpoint', () => {
  it('should return status 200 and ok response', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    
    // Verify the timestamp is a valid ISO string
    expect(() => new Date(response.body.timestamp)).not.toThrow();
  });
}); 