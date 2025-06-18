import { fetchProfileUrls } from '../getProfileUrl';
import { getAllUniquePhoneNumbers } from '../../database/services/userOperations';

jest.mock('../../database/services/userOperations', () => ({
  getAllUniquePhoneNumbers: jest.fn(),
}));

global.fetch = jest.fn();

describe('fetchProfileUrls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array if no phone numbers are found', async () => {
    (getAllUniquePhoneNumbers as jest.Mock).mockResolvedValue([]);

    const result = await fetchProfileUrls();
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch profile URLs and return data', async () => {
    const mockPhoneNumbers = ['+911234567890', '+919876543210'];
    const mockResponseData = {
      data: [
        { phoneNumber: '+911234567890', profilePicture: 'url1' },
        { phoneNumber: '+919876543210', profilePicture: 'url2' },
      ],
    };

    (getAllUniquePhoneNumbers as jest.Mock).mockResolvedValue(mockPhoneNumbers);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    });

    const result = await fetchProfileUrls();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/getProfileUrls'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers: mockPhoneNumbers }),
      })
    );

    expect(result).toEqual(mockResponseData.data);
  });

  it('should handle API errors gracefully', async () => {
    const mockPhoneNumbers = ['+911234567890'];
    (getAllUniquePhoneNumbers as jest.Mock).mockResolvedValue(mockPhoneNumbers);

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await fetchProfileUrls();
    expect(result).toEqual([]);
  });

  it('should handle exceptions gracefully', async () => {
    (getAllUniquePhoneNumbers as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await fetchProfileUrls();
    expect(result).toEqual([]);
  });
});
