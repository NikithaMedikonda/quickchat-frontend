jest.mock('react-i18next');

jest.mock('@react-native-firebase/app', () => ({
  firebase: {
    app: jest.fn(),
  },
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: jest.fn().mockResolvedValue('mock-token'),
  requestPermission: jest.fn(),
  onMessage: jest.fn(),
  setBackgroundMessageHandler: jest.fn(),
}));

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
    NONE: 0,
    UNSPECIFIED: -1000,
  },
  requestPermission: jest.fn(),
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
}));

jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));

jest.mock('./src/permissions/NotificationPermissions', () => ({
  getFCMToken: jest.fn().mockResolvedValue('mocked-token'),
  listenForForegroundMessages: jest.fn(),
}));


