module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|react-native-splash-screen|react-router-native|react-redux|react-native-libsodium|react-native-device-info)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '/.(png|jpg|jpeg|svg)$/': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/jest.global-mocks.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/assets/',
    '<rootDir>/src/constants/',
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
