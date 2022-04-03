/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'node_modules/',
    '.*.[d.g].ts',
    '.*.dev.ts',
    '.*.ethersService.ts',
    '.*.graphql.ts',
  ],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/src/.*/__mocks__'],
  testMatch: ['**/src/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
};
