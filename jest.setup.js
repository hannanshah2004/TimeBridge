// Polyfill for TextEncoder/TextDecoder which is required by supertest dependencies
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock global objects that might be missing in jsdom
global.URL.createObjectURL = jest.fn();

// Mock fetch if needed
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
); 