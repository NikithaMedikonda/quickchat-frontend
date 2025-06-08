import SQLite from 'react-native-sqlite-storage';
import { getDBInstance } from '../connection/connection';

jest.mock('react-native-sqlite-storage', () => {
  const mockDB = {
    transaction: jest.fn(cb =>
      cb({
        executeSql: jest.fn((successCallback) => {
          successCallback?.(null, {rows: {length: 0, item: () => ({})}});
        }),
      }),
    ),
    close: jest.fn(),
  };

  return {
    openDatabase: jest.fn(() => Promise.resolve(mockDB)),
    enablePromise: jest.fn(),
  };
});

describe('Test for getDBInstance function', () => {
  it('should open database successfully', async () => {
    const db = await getDBInstance();
    expect(SQLite.openDatabase).toHaveBeenCalledWith({
      name: 'quickChat.db',
      location: 'Documents',
    });

    expect(db).toHaveProperty('transaction');
  });
});
