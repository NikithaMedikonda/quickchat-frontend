import { getDBInstance } from '../connection/connection';
import {
  convertUrlToBase64,
  createUserInstance,
  getAllUniquePhoneNumbers,
  getLastSyncedTime,
  isUserStoredLocally,
  updateLastSyncedTime,
  updateUserProfilePictures,
  upsertUserInfo,
} from '../services/userOperations';

jest.mock('../connection/connection', () => ({
  getDBInstance: jest.fn(),
}));

jest.mock('rn-fetch-blob', () => ({
  config: jest.fn(() => ({
    fetch: jest.fn(() => Promise.resolve({
      base64: jest.fn(() => Promise.resolve('mocked_base64_data')),
    })),
  })),
}));

const mockExecuteSql = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getDBInstance as jest.Mock).mockResolvedValue({
    executeSql: mockExecuteSql,
  });
});

describe('userOperation DB functions', () => {
  test('upsertUserInfo inserts or replaces user correctly', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(
      upsertUserInfo(mockDb, {
        phoneNumber: '1234567890',
        name: 'Uski',
        profilePicture: 'pic-url',
        publicKey: 'public-key-123',
      }),
    ).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO LocalUsers'),
      ['1234567890', 'Uski', 'pic-url', 'public-key-123'],
    );
  });

  test('upsertUserInfo inserts or replaces user correctly even when name is not passed', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(
      upsertUserInfo(mockDb, {
        phoneNumber: '1234567890',
        name: '',
        profilePicture: 'pic-url',
        publicKey: 'public-key-123',
      }),
    ).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO LocalUsers'),
      ['1234567890', '', 'pic-url', 'public-key-123'],
    );
  });

  test('upsertUserInfo handles DB error gracefully', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockRejectedValueOnce(new Error('DB error'));

    await expect(
      upsertUserInfo(mockDb, {
        phoneNumber: '1234567890',
        name: 'Usha',
        profilePicture: 'pic.png',
        publicKey: 'pubKey',
      }),
    ).rejects.toThrow('DB error');
  });

  test('isUserStoredLocally returns true if user exists', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: 1,
        },
      },
    ]);

    const result = await isUserStoredLocally(mockDb, '1234567890');
    expect(result).toBe(true);
  });

  test('isUserStoredLocally returns false if user does not exist', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: 0,
        },
      },
    ]);

    const result = await isUserStoredLocally(mockDb, '0000000000');
    expect(result).toBe(false);
  });

  test('isUserStoredLocally handles DB failure', async () => {
    const mockDb = await getDBInstance();
    mockExecuteSql.mockRejectedValueOnce(new Error('Query Failed'));

    await expect(isUserStoredLocally(mockDb, '0000')).rejects.toThrow(
      'Query Failed',
    );
  });

  test('createUserInstance inserts a user with given phoneNumber and time', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(
      createUserInstance('1234567890', '2024-01-01T00:00:00Z'),
    ).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO User'),
      ['1234567890', '2024-01-01T00:00:00Z'],
    );
  });

  test('createUserInstance handles missing lastSyncedAt value', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(createUserInstance('999', '')).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO User'),
      ['999', new Date(0)],
    );
  });

  test('getLastSyncedTime returns lastSyncedAt if found', async () => {
    const mockDate = '2024-01-01T12:00:00Z';

    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: 1,
          item: () => ({
            lastSyncedAt: mockDate,
          }),
        },
      },
    ]);

    const result = await getLastSyncedTime('1234567890');
    expect(result).toBe(mockDate);
  });

  test('getLastSyncedTime inserts default if user not found', async () => {
    const defaultDate = new Date(0).toISOString();

    mockExecuteSql
      .mockResolvedValueOnce([
        {
          rows: {
            length: 0,
          },
        },
      ])
      .mockResolvedValueOnce([]);

    const result = await getLastSyncedTime('9999999999');
    expect(result).toBe(defaultDate);
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO User'),
      ['9999999999', defaultDate],
    );
  });

  test('getLastSyncedTime throws on DB failure', async () => {
    mockExecuteSql.mockRejectedValueOnce(new Error('DB crash'));

    await expect(getLastSyncedTime('fail')).rejects.toThrow('DB crash');
  });

  test('updateLastSyncedTime updates the timestamp correctly', async () => {
    mockExecuteSql.mockResolvedValueOnce([]);

    await expect(
      updateLastSyncedTime('2024-01-01T12:00:00Z', '1234567890'),
    ).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE User SET lastSyncedAt'),
      ['2024-01-01T12:00:00Z', '1234567890'],
    );
  });

  test('updateLastSyncedTime handles DB error', async () => {
    mockExecuteSql.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      updateLastSyncedTime('2024-01-01', '0000000000'),
    ).rejects.toThrow('Update failed');
  });
});

describe('updateUserProfilePictures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updates profile picture when valid data provided', async () => {
    const mockDb = await getDBInstance();
    const profiles = [
      { phoneNumber: '123', profilePicture: 'http://mock/image.png' },
    ];

    await updateUserProfilePictures(mockDb, profiles);

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO LocalUsers'),
      ['123', 'mocked_base64_data'],
    );
  });

  test('skips update if profilePicture is missing', async () => {
    const mockDb = await getDBInstance();
    const profiles = [{ phoneNumber: '123', profilePicture: '' }];

    await updateUserProfilePictures(mockDb, profiles);

    expect(mockExecuteSql).not.toHaveBeenCalled();
  });

  test('does not crash if profiles are undefined or not an array', async () => {
    const mockDb = await getDBInstance();

    await expect(updateUserProfilePictures(mockDb, undefined)).resolves.not.toThrow();
    await expect(updateUserProfilePictures(mockDb, null)).resolves.not.toThrow();
  });

  test('gracefully handles errors during DB update without crashing', async () => {
    const mockDb = await getDBInstance();
    const profiles = [
      { phoneNumber: '123', profilePicture: 'http://mock/image.png' },
    ];
    mockExecuteSql.mockRejectedValueOnce(new Error('Update failed'));

    await expect(updateUserProfilePictures(mockDb, profiles)).resolves.not.toThrow();

    expect(mockExecuteSql).toHaveBeenCalled();
  });
});

describe('convertUrlToBase64', () => {
  test('returns base64 string on success', async () => {
    const result = await convertUrlToBase64('http://mock-url.com/image.png');
    expect(result).toBe('mocked_base64_data');
  });
});

describe('getAllUniquePhoneNumbers', () => {
  test('returns unique phone numbers when data exists', async () => {
    const mockPhoneNumbers = ['123', '456'];
    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: mockPhoneNumbers.length,
          item: (index: number) => ({ phoneNumber: mockPhoneNumbers[index] }),
        },
      },
    ]);

    const result = await getAllUniquePhoneNumbers();
    expect(result).toEqual(mockPhoneNumbers);
  });

  test('returns empty array when no data found', async () => {
    mockExecuteSql.mockResolvedValueOnce([
      {
        rows: {
          length: 0,
          item: jest.fn(),
        },
      },
    ]);

    const result = await getAllUniquePhoneNumbers();
    expect(result).toEqual([]);
  });

  test('returns empty array on DB error', async () => {
    mockExecuteSql.mockRejectedValueOnce(new Error('DB failed'));

    const result = await getAllUniquePhoneNumbers();
    expect(result).toEqual([]);
  });
});

