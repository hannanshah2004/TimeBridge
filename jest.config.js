module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
  // Use this pattern to tell Jest how to map import paths
  moduleNameMapper: {
    '^../js/(.*)$': '<rootDir>/js/$1',
  },
  testPathIgnorePatterns: ['/node_modules/']
}; 