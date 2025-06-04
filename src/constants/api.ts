import { Platform } from 'react-native';

// export const API_URL = 'https://quickchat-backend-7pyd.onrender.com';
export const API_URL = Platform.OS === 'ios' ? 'http://localhost:5050' : 'http://10.0.2.2:5050';