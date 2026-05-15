import {
  EmailService,
  MockEmailProvider,
  SendGridProvider,
} from '../../../src/shared/services/notification/email.service';
import type { EmailMessage } from '../../../src/shared/services/notification/email.service';

// Mock logger
jest.mock('../../../src/shared/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Mock config
jest.mock('../../../src/shared/services/notification/notification.config', () => ({
  getNotificationConfig: () => ({
    email: {
      provider: 'mock',
      apiKey: 'test-key',
      fromEmail: 'test@test.com',
      fromName: 'Test',
      templates: {
        otpVerification: 'otp-template',
        passwordReset: 'reset-template',
        welcomeEmail: 'welcome-template',
        accountLocked: 'locked-template',
      },
    },
    sms: { provider: 'mock', accountSid: '', authToken: '', fromNumber: '', templates: { otpVerification: '', passwordReset: '' } },
    retry: { maxRetries: 2, initialDelay: 10, maxDelay: 100, backoffMultiplier: 2 },
  }),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockProvider: MockEmailProvider;

  beforeEach(() => {
    mockProvider = new MockEmailProvider();
    emailService = new EmailService(mockProvider);
  });

  describe('MockEmailProvider', () => {
    it('should store sent emails', async () => {
      const message: EmailMessage = {
        to: 'user@example.com',
        subject: 'Test',
        text: 'Hello',
      };

      const result = await mockProvider.send(message);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.messageId).toBeDefined();
      expect(mockProvider.getSentEmails()).toHaveLength(1);
      expect(mockProvider.getLastEmail()?.to).toBe('user@example.com');
    });

    it('should clear sent emails', async () => {
      await mockProvider.send({ to: 'a@a.com', subject: 'Test', text: '' });
      await mockProvider.send({ to: 'b@b.com', subject: 'Test', text: '' });
      expect(mockProvider.getSentEmails()).toHaveLength(2);

      mockProvider.clearSentEmails();
      expect(mockProvider.getSentEmails()).toHaveLength(0);
    });
  });

  describe('sendOtpEmail', () => {
    it('should send OTP email successfully', async () => {
      const result = await emailService.sendOtpEmail('user@example.com', '123456', 5);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');

      const lastEmail = mockProvider.getLastEmail();
      expect(lastEmail).toBeDefined();
      expect(lastEmail?.to).toBe('user@example.com');
      expect(lastEmail?.subject).toContain('OTP');
      expect(lastEmail?.subject).toContain('123456');
      expect(lastEmail?.html).toContain('123456');
      expect(lastEmail?.text).toContain('123456');
      expect(lastEmail?.text).toContain('5 phút');
    });

    it('should include expiry minutes in template data', async () => {
      await emailService.sendOtpEmail('user@example.com', '654321', 10);

      const lastEmail = mockProvider.getLastEmail();
      expect(lastEmail?.templateData?.otp).toBe('654321');
      expect(lastEmail?.templateData?.minutes).toBe('10');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const result = await emailService.sendPasswordResetEmail('user@example.com', '999999', 5);

      expect(result.success).toBe(true);

      const lastEmail = mockProvider.getLastEmail();
      expect(lastEmail?.subject).toContain('mật khẩu');
      expect(lastEmail?.html).toContain('999999');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with user name', async () => {
      const result = await emailService.sendWelcomeEmail('user@example.com', 'Nguyen Van A');

      expect(result.success).toBe(true);

      const lastEmail = mockProvider.getLastEmail();
      expect(lastEmail?.subject).toContain('Chào mừng');
      expect(lastEmail?.html).toContain('Nguyen Van A');
    });
  });

  describe('retry logic', () => {
    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const failingProvider: any = {
        getName: () => 'failing-mock',
        send: jest.fn().mockImplementation(async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return { success: true, messageId: 'retry-success', provider: 'failing-mock' };
        }),
      };

      const retryService = new EmailService(failingProvider);
      const result = await retryService.sendOtpEmail('user@example.com', '123456');

      expect(result.success).toBe(true);
      expect(failingProvider.send).toHaveBeenCalledTimes(3);
    });

    it('should return failure after max retries exhausted', async () => {
      const alwaysFailProvider: any = {
        getName: () => 'always-fail',
        send: jest.fn().mockRejectedValue(new Error('Permanent failure')),
      };

      const retryService = new EmailService(alwaysFailProvider);
      const result = await retryService.sendOtpEmail('user@example.com', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permanent failure');
      // maxRetries=2, so total attempts = 3
      expect(alwaysFailProvider.send).toHaveBeenCalledTimes(3);
    });
  });

  describe('SendGridProvider', () => {
    it('should throw if API key not configured', async () => {
      const provider = new SendGridProvider({
        provider: 'sendgrid',
        apiKey: '',
        fromEmail: 'test@test.com',
        fromName: 'Test',
        templates: { otpVerification: '', passwordReset: '', welcomeEmail: '', accountLocked: '' },
      });

      await expect(
        provider.send({ to: 'user@test.com', subject: 'Test', text: 'Hello' }),
      ).rejects.toThrow('SendGrid API key not configured');
    });
  });
});
