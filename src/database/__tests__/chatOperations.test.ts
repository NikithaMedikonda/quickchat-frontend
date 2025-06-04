import * as connectionModule from '../connection/connection';
import { clearChatLocally } from '../services/chatOperations';

const mockExecuteSql = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

describe('Tests for clearChatLocally function', () => {
  const chatId = 'chat123';
  const userPhoneNumber = '1234567890';
  const timestamp = Date.now();

  it('should update conversation if record exists', async () => {
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql.mockImplementation(query => {
        if (query.startsWith('SELECT')) {
          return Promise.resolve([{rows: {length: 1, item: () => ({})}}]);
        }
        return Promise.resolve();
      }),
    });

    await clearChatLocally(chatId, userPhoneNumber, timestamp);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Conversations'),
      [chatId, userPhoneNumber],
    );
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE Conversations'),
      [expect.any(String), chatId, userPhoneNumber],
    );
  });

  it('should insert conversation if no record exists', async () => {
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql.mockImplementation(query => {
        if (query.startsWith('SELECT')) {
          return Promise.resolve([{rows: {length: 0, item: () => null}}]);
        }
        return Promise.resolve();
      }),
    });

    await clearChatLocally(chatId, userPhoneNumber, timestamp);
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM Conversations'),
      [chatId, userPhoneNumber],
    );
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Conversations'),
      [chatId, userPhoneNumber, expect.any(String)],
    );
  });
});
