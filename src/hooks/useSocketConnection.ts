import {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {newSocket} from '../socket/socket';

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(newSocket.connected);
    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        newSocket.connect();
      }
    });

    return () => {
      newSocket.disconnect();
      newSocket.off();
      appStateSub.remove();
    };
  }, []);

  return {isConnected};
};
