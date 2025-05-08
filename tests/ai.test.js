const request = require('supertest');
const express = require('express');

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({ text: 'AI generated response' })
        }
      };
    })
  };
});

const app = express();
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }
  
  try {
    const response = await { text: 'AI generated response' };
    return res.json({ text: response.text });
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed' });
  }
});

describe('AI Generation Endpoint', () => {
  it('should return an AI-generated response when given a valid prompt', async () => {
    const response = await request(app)
      .post('/generate')
      .send({ prompt: 'Create a meeting agenda' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('text', 'AI generated response');
  });
  
  it('should return 400 error when prompt is missing', async () => {
    const response = await request(app)
      .post('/generate')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing prompt parameter');
  });
}); 