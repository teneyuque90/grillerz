import { Platform } from 'react-native';

const LOCAL_DEFAULT = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000'
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? LOCAL_DEFAULT;
export const OFFLINE_DEMO_MODE = process.env.EXPO_PUBLIC_OFFLINE_DEMO === 'true';
