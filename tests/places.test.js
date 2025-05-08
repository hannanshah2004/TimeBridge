const request = require('supertest');
const express = require('express');
const axios = require('axios');

jest.mock('axios');

const app = express();
app.use(express.json());

app.get('/api/autocomplete', async (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: 'Missing input' });

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input,
          key: 'fake-api-key',
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

describe('Places Autocomplete API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return suggestions when given a valid input query', async () => {
    const mockPlacesData = {
      predictions: [
        {
          place_id: 'ChIJOwg_06VPwokRYv534QaPC8g',
          description: 'New York, NY, USA',
          structured_formatting: {
            main_text: 'New York',
            secondary_text: 'NY, USA'
          }
        },
        {
          place_id: 'ChIJWa7XD39TwokRTeeOe9IaQ0M',
          description: 'Newark, NJ, USA',
          structured_formatting: {
            main_text: 'Newark',
            secondary_text: 'NJ, USA'
          }
        }
      ],
      status: 'OK'
    };
    
    axios.get.mockResolvedValueOnce({ data: mockPlacesData });
    
    const response = await request(app).get('/api/autocomplete?input=New');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPlacesData);
    expect(axios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      expect.objectContaining({
        params: expect.objectContaining({
          input: 'New',
          key: 'fake-api-key'
        })
      })
    );
  });

  it('should return 400 when input parameter is missing', async () => {
    const response = await request(app).get('/api/autocomplete');
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing input');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should handle API errors properly', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    const response = await request(app).get('/api/autocomplete?input=New');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Autocomplete failed');
  });
}); 