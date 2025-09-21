module.exports = {
  testMatch: ['**/?(*.)(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  rootDir: '',
  transform: {
    '.(ts|tsx)': '@swc/jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  watchAll: false,
  collectCoverage: true,
  coverageDirectory: './docs/jest-coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
};
