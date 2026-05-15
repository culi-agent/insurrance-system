import { OtpService } from '../../../src/modules/auth/services/otp.service';

describe('OtpService', () => {
  beforeEach(() => {
    // Clear any stored OTPs between tests by generating and consuming them
    // or rely on unique keys per test
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP by default', () => {
      const otp = OtpService.generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate numeric-only OTP', () => {
      const otp = OtpService.generateOtp();
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on subsequent calls (probabilistic)', () => {
      const otps = new Set<string>();
      for (let i = 0; i < 100; i++) {
        otps.add(OtpService.generateOtp());
      }
      // With 6 digits (1M possibilities), 100 calls should produce at least 90 unique values
      expect(otps.size).toBeGreaterThan(90);
    });
  });

  describe('storeOtp and verifyOtp', () => {
    it('should store and verify OTP successfully', () => {
      const key = 'test:store-verify';
      const otp = '123456';
      OtpService.storeOtp(key, otp);
      expect(OtpService.verifyOtp(key, otp)).toBe(true);
    });

    it('should return false for wrong OTP', () => {
      const key = 'test:wrong-otp';
      OtpService.storeOtp(key, '123456');
      expect(OtpService.verifyOtp(key, '654321')).toBe(false);
    });

    it('should return false for non-existent key', () => {
      expect(OtpService.verifyOtp('test:non-existent', '123456')).toBe(false);
    });

    it('should be single-use (OTP consumed after successful verification)', () => {
      const key = 'test:single-use';
      const otp = '111111';
      OtpService.storeOtp(key, otp);

      // First verification should succeed
      expect(OtpService.verifyOtp(key, otp)).toBe(true);

      // Second verification should fail (already consumed)
      expect(OtpService.verifyOtp(key, otp)).toBe(false);
    });

    it('should return false for expired OTP', () => {
      // This test requires manipulating time
      jest.useFakeTimers();

      const key = 'test:expired';
      const otp = '222222';
      OtpService.storeOtp(key, otp);

      // Advance time beyond OTP expiry (5 minutes + 1 second)
      jest.advanceTimersByTime(301 * 1000);

      expect(OtpService.verifyOtp(key, otp)).toBe(false);

      jest.useRealTimers();
    });

    it('should handle overwriting OTP for same key', () => {
      const key = 'test:overwrite';
      OtpService.storeOtp(key, '111111');
      OtpService.storeOtp(key, '222222');

      expect(OtpService.verifyOtp(key, '111111')).toBe(false);
      expect(OtpService.verifyOtp(key, '222222')).toBe(true);
    });
  });

  describe('sendEmailOtp', () => {
    it('should log OTP sending (mock in test env)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await OtpService.sendEmailOtp('test@example.com', '123456');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('123456'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com'),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendSmsOtp', () => {
    it('should log OTP sending (mock in test env)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await OtpService.sendSmsOtp('+84912345678', '654321');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('654321'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('+84912345678'),
      );
      consoleSpy.mockRestore();
    });
  });
});
