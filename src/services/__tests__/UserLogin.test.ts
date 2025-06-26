import { verifyUserDetails } from '../UserLoginStatus';

describe('verifyUserDetails', () => {
  const mockPhone = '9999999999';
  const mockPassword = 'password123';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return user details on success', async () => {
    const mockResponseData = {
      isLogin: true,
      name: 'Test User',
      email: 'test@example.com',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockResponseData,
    });

    const result = await verifyUserDetails(mockPhone, mockPassword);

    expect(result).toEqual({
      status: 200,
      ...mockResponseData,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/status'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: mockPhone, password: mockPassword }),
      })
    );
  });

  it('should throw an error if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(verifyUserDetails(mockPhone, mockPassword)).rejects.toThrow('Network error');
  });
});
