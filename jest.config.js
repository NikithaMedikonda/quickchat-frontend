module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    '/node_modules/(?!react-router-native)/',
  ],
  moduleNameMapper: {
     "/\.(png|jpg|jpeg|svg)$/": "<rootDir>/__mocks__/fileMock.js",
  },
};
