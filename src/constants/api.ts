// export const API_URL = 'https://quickchat-backend-7pyd.onrender.com';

import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'ios' ? `http://localhost:5050` : `http://192.168.0.5:5050`;