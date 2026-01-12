module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: ['node_modules/(?!(supertest|.*\\.mjs$))']
};