import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { createTables } from '../models/schema';

describe('Test for createTables function', () => {
  const mockExecuteSql = jest.fn();
  const mockDb = {executeSql: mockExecuteSql} as unknown as SQLiteDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create all tables in the correct order', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);
    mockExecuteSql.mockResolvedValueOnce([]);
    mockExecuteSql.mockResolvedValueOnce([]);
    mockExecuteSql.mockResolvedValueOnce([]);
    mockExecuteSql.mockResolvedValueOnce([]);
    mockExecuteSql.mockResolvedValueOnce([]);

    await createTables(mockDb);

    expect(mockExecuteSql).toHaveBeenCalledTimes(6);
    expect(mockExecuteSql.mock.calls[0][0]).toMatch(
      /CREATE TABLE IF NOT EXISTS Chats/i,
    );
    expect(mockExecuteSql.mock.calls[1][0]).toMatch(
      /CREATE TABLE IF NOT EXISTS Messages/i,
    );
    expect(mockExecuteSql.mock.calls[2][0]).toMatch(
      /CREATE TABLE\s+IF NOT EXISTS Queue/i,
    );
    expect(mockExecuteSql.mock.calls[3][0]).toMatch(
      /CREATE TABLE IF NOT EXISTS Conversations/i,
    );
    expect(mockExecuteSql.mock.calls[4][0]).toMatch(
      /CREATE TABLE IF NOT EXISTS UserRestrictions/i,
    );
    expect(mockExecuteSql.mock.calls[5][0]).toMatch(
      /CREATE TABLE IF NOT EXISTS DeletedUsers/i,
    );
  });
});
