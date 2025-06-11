import * as connectionModule from '../connection/connection';
import {
    checkBlockedStatusLocal,
    deleteUserRestriction,
    insertDeletedUser,
    insertUserRestriction,
    isUserDeletedLocal,
} from '../services/userRestriction';

const mockExecuteSql = jest.fn();

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

describe('Test for insertUserRestriction function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (connectionModule.getDBInstance as jest.Mock).mockResolvedValue({
      executeSql: mockExecuteSql,
    });
  });
  it('should insert a user restriction entry', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);
    await insertUserRestriction('123', '456');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO UserRestrictions'),
      expect.arrayContaining(['123', '456']),
    );
  });
});

describe('Test for deleteUserRestriction entry', () => {
  it('should delete a user restriction', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);
    await deleteUserRestriction('123', '456');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM UserRestrictions'),
      expect.arrayContaining(['123', '456']),
    );
  });
});

describe('Test for checkBlockedStatusLocal status', () => {
  it('should return true if restriction exists', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 1, item: jest.fn(() => ({}))}},
    ]);
    const result = await checkBlockedStatusLocal('123', '456');
    expect(result).toBe(true);
  });

  it('should return false if restriction does not exist', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    const result = await checkBlockedStatusLocal('123', '456');
    expect(result).toBe(false);
  });
});

describe('Test for insertDeletedUser function', () => {
  it('should insert a deleted user', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);
    await insertDeletedUser('123456789');
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO DeletedUsers'),
      expect.arrayContaining(['123456789']),
    );
  });
});

describe('Test for isUserDeletedLocal function', () => {
  it('should return true if user is deleted', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 1, item: jest.fn(() => ({}))}},
    ]);
    const result = await isUserDeletedLocal('123456789');
    expect(result).toBe(true);
  });

  it('should return false if user is not deleted', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {rows: {length: 0, item: jest.fn()}},
    ]);
    const result = await isUserDeletedLocal('123456789');
    expect(result).toBe(false);
  });
}
);
