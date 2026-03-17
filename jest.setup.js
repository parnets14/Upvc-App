import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'android',
      Version: 33,
      select: jest.fn((obj) => obj.android || obj.default),
    },
    PermissionsAndroid: {
      PERMISSIONS: {
        READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
        READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
        READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again',
      },
      requestMultiple: jest.fn(() => Promise.resolve({
        'android.permission.READ_MEDIA_VIDEO': 'granted',
        'android.permission.READ_MEDIA_IMAGES': 'granted',
      })),
      request: jest.fn(() => Promise.resolve('granted')),
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
      openSettings: jest.fn(),
    },
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));