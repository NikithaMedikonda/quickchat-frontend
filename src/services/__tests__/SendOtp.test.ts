import {sendOtp, sendLoginOtp} from '../SendOtp';

describe('Tests for sendOtp', () => {
  const mockData = {
    phoneNumber: '9999999999',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return status code on success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
    });

    const status = await sendOtp(
      mockData.phoneNumber,
      mockData.name,
      mockData.email,
    );
    expect(status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/register/otp'),
      expect.objectContaining({
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mockData),
      }),
    );
  });

  it('should throw an error on failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    await expect(
      sendOtp(mockData.phoneNumber, mockData.name, mockData.email),
    ).rejects.toThrow('Network Error');
  });
});

describe('sendLoginOtp', () => {
  const mockData = {
    name: 'LoginUser',
    email: 'login@example.com',
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return true if login OTP is sent successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({status: 200});

    const result = await sendLoginOtp(mockData.name, mockData.email);
    expect(result).toBe(true);
  });

  it('should return false if login OTP fails (non-200)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({status: 400});

    const result = await sendLoginOtp(mockData.name, mockData.email);
    expect(result).toBe(false);
  });

  it('should throw an error if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    await expect(sendLoginOtp(mockData.name, mockData.email)).rejects.toThrow(
      'Fetch failed',
    );
  });
});
