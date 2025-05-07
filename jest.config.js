module.exports = {
  preset: 'react-native',
transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|react-native-splash-screen|react-router-native|react-redux)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
     // eslint-disable-next-line no-useless-escape
     '/\.(png|jpg|jpeg|svg)$/': '<rootDir>/__mocks__/fileMock.js',
  },
};
