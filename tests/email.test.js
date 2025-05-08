const request = require('supertest');
const express = require('express');

jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue([
      { statusCode: 202 },
      { body: { message: 'Email sent successfully' } }
    ])
  };
});

const app = express();
app.use(express.json());
const sgMail = require('@sendgrid/mail');

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const recipients = Array.isArray(email)
    ? email
    : String(email)
        .split(/[,;\s]+/)
        .map(e => e.trim())
        .filter(e => e);

  const msg = {
    to: recipients,
    from: 'test@example.com',
    subject: `New message from ${name}`,
    text: message,
    html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    await sgMail.send(msg);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

describe('Email Sending Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully send an email with valid parameters', async () => {
    const response = await request(app)
      .post('/send-email')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok', true);
    expect(sgMail.send).toHaveBeenCalledTimes(1);
    
    const call = sgMail.send.mock.calls[0][0];
    expect(call.subject).toBe('New message from Test User');
    expect(call.text).toBe('This is a test message');
    expect(call.to).toEqual(['test@example.com']);
  });
  
  it('should handle multiple email recipients', async () => {
    const response = await request(app)
      .post('/send-email')
      .send({
        name: 'Test User',
        email: 'test1@example.com, test2@example.com',
        message: 'This is a test message'
      });
    
    expect(response.status).toBe(200);
    
    const call = sgMail.send.mock.calls[0][0];
    expect(call.to).toEqual(['test1@example.com', 'test2@example.com']);
  });
  
  it('should handle array of email recipients', async () => {
    const response = await request(app)
      .post('/send-email')
      .send({
        name: 'Test User',
        email: ['test1@example.com', 'test2@example.com'],
        message: 'This is a test message'
      });
    
    expect(response.status).toBe(200);
    
    const call = sgMail.send.mock.calls[0][0];
    expect(call.to).toEqual(['test1@example.com', 'test2@example.com']);
  });
  
  it('should return 400 when required parameters are missing', async () => {
    const response = await request(app)
      .post('/send-email')
      .send({
        name: 'Test User',
        message: 'This is a test message'
      });
    
    expect(response.status).toBe(400);
    expect(sgMail.send).not.toHaveBeenCalled();
  });
}); 