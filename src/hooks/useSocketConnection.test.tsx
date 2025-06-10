import { act, render } from '@testing-library/react-native';
import React from 'react';
import { AppState } from 'react-native';
import { newSocket } from '../socket/socket';
import { useSocketConnection } from './useSocketConnection';

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

jest.mock('../socket/socket', () => ({
  newSocket: {
    connected: false,
    on: jest.fn(),
    connect: jest.fn(),
  },
}));

interface SocketConnectionResult {
  isConnected: boolean;
}

interface TestComponentProps {
  onHookResult: (result: SocketConnectionResult) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({onHookResult}) => {
  const hookResult = useSocketConnection();

  React.useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);

  return null;
};

describe('useSocketConnection', () => {
  let mockAppStateListener: (state: string | null | undefined) => void;
  let mockSocketEventHandlers: Record<string, () => void>;
  let mockAppStateSubscription: {remove: jest.Mock};
  let hookResult: SocketConnectionResult;
  let onHookResult: jest.Mock<void, [SocketConnectionResult]>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketEventHandlers = {};
    mockAppStateSubscription = {
      remove: jest.fn(),
    };
    (AppState.addEventListener as jest.Mock).mockImplementation((event: string, callback: (state: string | null | undefined) => void) => {
      mockAppStateListener = callback;
      return mockAppStateSubscription;
    });

    (newSocket.on as jest.Mock).mockImplementation((event: string, handler: () => void) => {
      mockSocketEventHandlers[event] = handler;
    });

    newSocket.connected = false;

    onHookResult = jest
      .fn<void, [SocketConnectionResult]>()
      .mockImplementation((result: SocketConnectionResult) => {
        hookResult = result;
      });
  });

  describe('Initial state and setup', () => {
    it('should initialize with socket connected state when socket is connected', () => {
      newSocket.connected = true;
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(true);
    });

    it('should initialize with socket disconnected state when socket is disconnected', () => {
      newSocket.connected = false;
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
    });

    it('should set up socket event listeners on mount', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(newSocket.on).toHaveBeenCalledWith(
        'internet_connection',
        expect.any(Function),
      );
      expect(newSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function),
      );
      expect(newSocket.on).toHaveBeenCalledTimes(2);
    });

    it('should set up AppState listener on mount', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(AppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      );
      expect(AppState.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Socket event handling', () => {
    it('should update isConnected to true when internet_connection event is fired', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
    });

    it('should update isConnected to false when disconnect event is fired', () => {
      newSocket.connected = true;
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(true);
      act(() => {
        mockSocketEventHandlers.disconnect();
      });
      expect(hookResult.isConnected).toBe(false);
    });

    it('should handle multiple socket events correctly', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
      act(() => {
        mockSocketEventHandlers.disconnect();
      });
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
    });
  });

  describe('AppState handling', () => {
    it('should call socket.connect when app becomes active', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      act(() => {
        mockAppStateListener('active');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(1);
    });

    it('should not call socket.connect when app state is not active', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      act(() => {
        mockAppStateListener('background');
      });
      expect(newSocket.connect).not.toHaveBeenCalled();
      act(() => {
        mockAppStateListener('inactive');
      });
      expect(newSocket.connect).not.toHaveBeenCalled();
    });

    it('should handle multiple app state changes correctly', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      act(() => {
        mockAppStateListener('background');
      });
      expect(newSocket.connect).not.toHaveBeenCalled();
      act(() => {
        mockAppStateListener('active');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(1);
      act(() => {
        mockAppStateListener('inactive');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(1);
      act(() => {
        mockAppStateListener('active');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cleanup', () => {
    it('should remove AppState listener on unmount', () => {
      const {unmount} = render(<TestComponent onHookResult={onHookResult} />);
      expect(mockAppStateSubscription.remove).not.toHaveBeenCalled();
      unmount();
      expect(mockAppStateSubscription.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup when subscription remove method is called multiple times', () => {
      const {unmount} = render(<TestComponent onHookResult={onHookResult} />);
      unmount();
      expect(mockAppStateSubscription.remove).toHaveBeenCalledTimes(1);
      expect(() => mockAppStateSubscription.remove()).not.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle socket connection and app state changes together', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockAppStateListener('active');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(1);
      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
      act(() => {
        mockSocketEventHandlers.disconnect();
      });
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockAppStateListener('active');
      });
      expect(newSocket.connect).toHaveBeenCalledTimes(2);
    });

    it('should maintain state consistency across re-renders', () => {
      const {rerender} = render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
      rerender(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(true);
      act(() => {
        mockSocketEventHandlers.disconnect();
      });
      expect(hookResult.isConnected).toBe(false);
      rerender(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined app state gracefully', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(() => {
        act(() => {
          mockAppStateListener(undefined);
        });
      }).not.toThrow();

      expect(newSocket.connect).not.toHaveBeenCalled();
    });

    it('should handle null app state gracefully', () => {
      render(<TestComponent onHookResult={onHookResult} />);
      expect(() => {
        act(() => {
          mockAppStateListener(null);
        });
      }).not.toThrow();
      expect(newSocket.connect).not.toHaveBeenCalled();
    });

    it('should work when socket is initially connected', () => {
      newSocket.connected = true;
      render(<TestComponent onHookResult={onHookResult} />);
      expect(hookResult.isConnected).toBe(true);
      act(() => {
        mockSocketEventHandlers.disconnect();
      });
      expect(hookResult.isConnected).toBe(false);

      act(() => {
        mockSocketEventHandlers.internet_connection();
      });
      expect(hookResult.isConnected).toBe(true);
    });
  });
});
