import {clearLocalStorage} from '../services/clearStorage';
import {getDBInstance} from '../connection/connection';

jest.mock('../connection/connection');

describe('clearLocalStorage', () => {
  const executeSqlMock = jest.fn();
  const mockDb = {executeSql: executeSqlMock};

  beforeEach(() => {
    (getDBInstance as jest.Mock).mockResolvedValue(mockDb);
    executeSqlMock.mockClear();
  });

  it('should execute DELETE FROM on all expected tables', async () => {
    await clearLocalStorage();

    const expectedTables = [
      'Chats',
      'User',
      'Messages',
      'Queue',
      'Conversations',
      'UserRestrictions',
      'LocalUsers',
    ];

    expect(executeSqlMock).toHaveBeenCalledTimes(expectedTables.length);

    for (const table of expectedTables) {
      expect(executeSqlMock).toHaveBeenCalledWith(`DELETE FROM ${table}`);
    }
  });
});
