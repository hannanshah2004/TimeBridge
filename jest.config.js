module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
  // Use this pattern to tell Jest how to map import paths
  moduleNameMapper: {
    '^../js/(.*)$': '<rootDir>/js/$1',
  },
}; 