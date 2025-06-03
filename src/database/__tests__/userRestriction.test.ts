import * as connectionModule from '../connection/connection';
import {
    checkBlockedStatusLocal,
    deleteUserRestriction,
    insertUserRestriction,
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
