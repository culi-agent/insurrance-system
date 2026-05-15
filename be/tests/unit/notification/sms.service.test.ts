import {
  SmsService,
  MockSmsProvider,
  TwilioProvider,
} from '../../../src/shared/services/notification/sms.service';

// Mock logger
jest.mock('../../../src/shared/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Mock config
jest.mock('../../../src/shared/services/notification/notification.config', () => ({
  getNotificationConfig: () => ({
    email: { provider: 'mock', apiKey: '', fromEmail: '', fromName: '', templates: {} },
    sms: {
      provider: 'mock',
      accountSid: 'test-sid',
      authToken: 'test-token',
      fromNumber: '+84900000000',
      templates: {
        otpVerification: 'Mã OTP của bạn là: {otp}. Hết hạn sau {minutes} phút. Không chia sẻ mã này.',
        passwordReset: 'Mã đặt lại mật khẩu: {otp}. Hết hạn sau {minutes} phút.',
      },
    },
    retry: { maxRetries: 2, initialDelay: 10, maxDelay: 100, backoffMultiplier: 2 },
  }),
}));

describe('SmsService', () => {
  let smsService: SmsService;
  let mockProvider: MockSmsProvider;

  beforeEach(() => {
    mockProvider = new MockSmsProvider();
    smsService = new SmsService(mockProvider);
  });

  describe('MockSmsProvider', () => {
    it('should store sent messages', async () => {
      const result = await mockProvider.send({ to: '+84912345678', body: 'Test message' });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.messageId).toBeDefined();
      expect(mockProvider.getSentMessages()).toHaveLength(1);
      expect(mockProvider.getLastMessage()?.to).toBe('+84912345678');
      expect(mockProvider.getLastMessage()?.body).toBe('Test message');
    });

    it('should clear sent messages', async () => {
      await mockProvider.send({ to: '+84111', body: 'A' });
      await mockProvider.send({ to: '+84222', body: 'B' });
      expect(mockProvider.getSentMessages()).toHaveLength(2);

      mockProvider.clearSentMessages();
      expect(mockProvider.getSentMessages()).toHaveLength(0);
    });
  });

  describe('sendOtpSms', () => {
    it('should send OTP SMS with correct template', async () => {
      const result = await smsService.sendOtpSms('+84912345678', '123456', 5);

      expect(result.success).toBe(true);

      const lastMsg = mockProvider.getLastMessage();
      expect(lastMsg).toBeDefined();
      expect(lastMsg?.to).toBe('+84912345678');
      expect(lastMsg?.body).toContain('123456');
      expect(lastMsg?.body).toContain('5 phút');
      expect(lastMsg?.body).toContain('Không chia sẻ');
    });

    it('should replace template variables correctly', async () => {
      await smsService.sendOtpSms('+84999888777', '654321', 10);

      const lastMsg = mockProvider.getLastMessage();
      expect(lastMsg?.body).toBe('Mã OTP của bạn là: 654321. Hết hạn sau 10 phút. Không chia sẻ mã này.');
    });
  });

  describe('sendPasswordResetSms', () => {
    it('should send password reset SMS', async () => {
      const result = await smsService.sendPasswordResetSms('+84912345678', '888888', 5);

      expect(result.success).toBe(true);

      const lastMsg = mockProvider.getLastMessage();
      expect(lastMsg?.body).toContain('888888');
      expect(lastMsg?.body).toContain('đặt lại mật khẩu');
    });
  });

  describe('retry logic', () => {
    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const flakyProvider: any = {
        getName: () => 'flaky',
        send: jest.fn().mockImplementation(async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Network timeout');
          }
          return { success: true, messageId: 'recovered', provider: 'flaky' };
        }),
      };

      const retryService = new SmsService(flakyProvider);
      const result = await retryService.sendOtpSms('+84912345678', '111111');

      expect(result.success).toBe(true);
      expect(flakyProvider.send).toHaveBeenCalledTimes(2);
    });

    it('should return failure after max retries', async () => {
      const failProvider: any = {
        getName: () => 'fail',
        send: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      const retryService = new SmsService(failProvider);
      const result = await retryService.sendOtpSms('+84912345678', '111111');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Service unavailable');
      expect(failProvider.send).toHaveBeenCalledTimes(3); // 1 + 2 retries
    });
  });

  describe('TwilioProvider', () => {
    it('should throw if credentials not configured', async () => {
      const provider = new TwilioProvider({
        provider: 'twilio',
        accountSid: '',
        authToken: '',
        fromNumber: '+84900000000',
        templates: { otpVerification: '', passwordReset: '' },
      });

      await expect(
        provider.send({ to: '+84912345678', body: 'Test' }),
      ).rejects.toThrow('Twilio credentials not configured');
    });

    it('should throw if from number not configured', async () => {
      const provider = new TwilioProvider({
        provider: 'twilio',
        accountSid: 'AC123',
        authToken: 'token',
        fromNumber: '',
        templates: { otpVerification: '', passwordReset: '' },
      });

      await expect(
        provider.send({ to: '+84912345678', body: 'Test' }),
      ).rejects.toThrow('Twilio from number not configured');
    });
  });
});
