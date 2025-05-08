// Polyfill for TextEncoder/TextDecoder which is required by supertest dependencies
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  console.log('TextEncoder and TextDecoder polyfills applied');
}

// Mock global objects that might be missing in jsdom
if (typeof URL.createObjectURL === 'undefined') {
  global.URL.createObjectURL = jest.fn();
}

// Mock fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
} 