import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  resendOtpSchema,
  refreshTokenSchema,
  socialLoginSchema,
} from '../../../src/modules/auth/validators/auth.validator';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    const validData = {
      email: 'user@example.com',
      phone: '+84912345678',
      password: 'Password1!',
      confirm_password: 'Password1!',
      full_name: 'Test User',
      agree_terms: true,
    };

    it('should validate correct registration data', () => {
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const { error } = registerSchema.validate({ ...validData, email: 'not-an-email' });
      expect(error).toBeDefined();
      expect(error!.details[0].path).toContain('email');
    });

    it('should reject invalid phone format (must be +84)', () => {
      const { error } = registerSchema.validate({ ...validData, phone: '0912345678' });
      expect(error).toBeDefined();
      expect(error!.details[0].path).toContain('phone');
    });

    it('should accept valid +84 phone numbers', () => {
      const { error } = registerSchema.validate({ ...validData, phone: '+84987654321' });
      expect(error).toBeUndefined();
    });

    it('should reject password without uppercase', () => {
      const { error } = registerSchema.validate({
        ...validData,
        password: 'password1!',
        confirm_password: 'password1!',
      });
      expect(error).toBeDefined();
    });

    it('should reject password without number', () => {
      const { error } = registerSchema.validate({
        ...validData,
        password: 'Password!',
        confirm_password: 'Password!',
      });
      expect(error).toBeDefined();
    });

    it('should reject password without special character', () => {
      const { error } = registerSchema.validate({
        ...validData,
        password: 'Password1',
        confirm_password: 'Password1',
      });
      expect(error).toBeDefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const { error } = registerSchema.validate({
        ...validData,
        password: 'Pa1!',
        confirm_password: 'Pa1!',
      });
      expect(error).toBeDefined();
    });

    it('should reject mismatched confirm_password', () => {
      const { error } = registerSchema.validate({
        ...validData,
        confirm_password: 'DifferentPassword1!',
      });
      expect(error).toBeDefined();
      expect(error!.details[0].path).toContain('confirm_password');
    });

    it('should reject if full_name too short', () => {
      const { error } = registerSchema.validate({ ...validData, full_name: 'A' });
      expect(error).toBeDefined();
    });

    it('should reject if agree_terms is false', () => {
      const { error } = registerSchema.validate({ ...validData, agree_terms: false });
      expect(error).toBeDefined();
    });

    it('should reject if agree_terms is missing', () => {
      const { agree_terms, ...noTerms } = validData;
      const { error } = registerSchema.validate(noTerms);
      expect(error).toBeDefined();
    });

    it('should reject missing required fields', () => {
      const { error } = registerSchema.validate({});
      expect(error).toBeDefined();
      expect(error!.details.length).toBeGreaterThan(0);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const { error } = loginSchema.validate({
        email_or_phone: 'user@example.com',
        password: 'Password1!',
      });
      expect(error).toBeUndefined();
    });

    it('should accept phone as email_or_phone', () => {
      const { error } = loginSchema.validate({
        email_or_phone: '+84912345678',
        password: 'Password1!',
      });
      expect(error).toBeUndefined();
    });

    it('should default remember_me to false', () => {
      const { error, value } = loginSchema.validate({
        email_or_phone: 'user@example.com',
        password: 'pass',
      });
      expect(error).toBeUndefined();
      expect(value.remember_me).toBe(false);
    });

    it('should reject missing email_or_phone', () => {
      const { error } = loginSchema.validate({ password: 'pass' });
      expect(error).toBeDefined();
    });

    it('should reject missing password', () => {
      const { error } = loginSchema.validate({ email_or_phone: 'user@example.com' });
      expect(error).toBeDefined();
    });
  });

  describe('verifyOtpSchema', () => {
    it('should validate correct OTP data', () => {
      const { error } = verifyOtpSchema.validate({
        email: 'user@example.com',
        otp: '123456',
        channel: 'email',
      });
      expect(error).toBeUndefined();
    });

    it('should reject OTP not exactly 6 characters', () => {
      const { error } = verifyOtpSchema.validate({
        email: 'user@example.com',
        otp: '12345',
      });
      expect(error).toBeDefined();
    });

    it('should default channel to email', () => {
      const { error, value } = verifyOtpSchema.validate({
        email: 'user@example.com',
        otp: '123456',
      });
      expect(error).toBeUndefined();
      expect(value.channel).toBe('email');
    });

    it('should accept sms channel', () => {
      const { error } = verifyOtpSchema.validate({
        email: 'user@example.com',
        otp: '123456',
        channel: 'sms',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid channel', () => {
      const { error } = verifyOtpSchema.validate({
        email: 'user@example.com',
        otp: '123456',
        channel: 'whatsapp',
      });
      expect(error).toBeDefined();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate with email', () => {
      const { error } = forgotPasswordSchema.validate({ email_or_phone: 'user@example.com' });
      expect(error).toBeUndefined();
    });

    it('should reject empty body', () => {
      const { error } = forgotPasswordSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('resetPasswordSchema', () => {
    const validReset = {
      email: 'user@example.com',
      otp: '123456',
      new_password: 'NewPassword1!',
      confirm_password: 'NewPassword1!',
    };

    it('should validate correct reset data', () => {
      const { error } = resetPasswordSchema.validate(validReset);
      expect(error).toBeUndefined();
    });

    it('should reject weak new password', () => {
      const { error } = resetPasswordSchema.validate({
        ...validReset,
        new_password: 'weak',
        confirm_password: 'weak',
      });
      expect(error).toBeDefined();
    });

    it('should reject mismatched confirm password', () => {
      const { error } = resetPasswordSchema.validate({
        ...validReset,
        confirm_password: 'Different1!',
      });
      expect(error).toBeDefined();
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct change password data', () => {
      const { error } = changePasswordSchema.validate({
        current_password: 'OldPassword1!',
        new_password: 'NewPassword1!',
        confirm_password: 'NewPassword1!',
      });
      expect(error).toBeUndefined();
    });

    it('should reject missing current_password', () => {
      const { error } = changePasswordSchema.validate({
        new_password: 'NewPassword1!',
        confirm_password: 'NewPassword1!',
      });
      expect(error).toBeDefined();
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate valid profile update', () => {
      const { error } = updateProfileSchema.validate({
        full_name: 'Updated Name',
        gender: 'male',
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty update (min 1 field required)', () => {
      const { error } = updateProfileSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should reject invalid gender', () => {
      const { error } = updateProfileSchema.validate({ gender: 'invalid' });
      expect(error).toBeDefined();
    });

    it('should accept valid address object', () => {
      const { error } = updateProfileSchema.validate({
        address: { city: 'Hanoi', district: 'Cau Giay' },
      });
      expect(error).toBeUndefined();
    });

    it('should accept valid language values', () => {
      const { error: viError } = updateProfileSchema.validate({ language: 'vi' });
      const { error: enError } = updateProfileSchema.validate({ language: 'en' });
      expect(viError).toBeUndefined();
      expect(enError).toBeUndefined();
    });

    it('should reject invalid language', () => {
      const { error } = updateProfileSchema.validate({ language: 'fr' });
      expect(error).toBeDefined();
    });
  });

  describe('socialLoginSchema', () => {
    it('should validate google provider', () => {
      const { error } = socialLoginSchema.validate({ provider: 'google', token: 'token123' });
      expect(error).toBeUndefined();
    });

    it('should validate facebook provider', () => {
      const { error } = socialLoginSchema.validate({ provider: 'facebook', token: 'token123' });
      expect(error).toBeUndefined();
    });

    it('should reject unsupported provider', () => {
      const { error } = socialLoginSchema.validate({ provider: 'twitter', token: 'token123' });
      expect(error).toBeDefined();
    });

    it('should reject missing token', () => {
      const { error } = socialLoginSchema.validate({ provider: 'google' });
      expect(error).toBeDefined();
    });
  });

  describe('resendOtpSchema', () => {
    it('should validate correct resend OTP data', () => {
      const { error } = resendOtpSchema.validate({ email: 'user@example.com', type: 'verify' });
      expect(error).toBeUndefined();
    });

    it('should accept reset type', () => {
      const { error } = resendOtpSchema.validate({ email: 'user@example.com', type: 'reset' });
      expect(error).toBeUndefined();
    });

    it('should reject invalid type', () => {
      const { error } = resendOtpSchema.validate({ email: 'user@example.com', type: 'invalid' });
      expect(error).toBeDefined();
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate with refresh_token', () => {
      const { error } = refreshTokenSchema.validate({ refresh_token: 'some-token-value' });
      expect(error).toBeUndefined();
    });

    it('should reject missing refresh_token', () => {
      const { error } = refreshTokenSchema.validate({});
      expect(error).toBeDefined();
    });
  });
});
