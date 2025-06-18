import { Platform } from "react-native";

// export const API_URL = 'https://quickchat-backend-7pyd.onrender.com';
export const API_URL = Platform.OS === 'ios' ? `http://192.168.0.5:5050` : `http://192.168.0.5:5050`;