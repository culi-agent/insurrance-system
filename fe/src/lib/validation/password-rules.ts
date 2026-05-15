import { z } from 'zod';

/**
 * Shared password validation rules - must stay in sync with backend (Joi).
 *
 * Rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (@$!%*?&)
 */

export const PASSWORD_RULES = {
  minLength: 8,
  patterns: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /\d/,
    specialChar: /[@$!%*?&]/,
  },
  messages: {
    minLength: 'Mật khẩu phải có ít nhất 8 ký tự',
    uppercase: 'Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)',
    lowercase: 'Mật khẩu phải có ít nhất 1 chữ thường (a-z)',
    digit: 'Mật khẩu phải có ít nhất 1 chữ số (0-9)',
    specialChar: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)',
    confirmMismatch: 'Mật khẩu xác nhận không khớp',
  },
} as const;

/**
 * Zod schema for password field - used across all forms that accept passwords.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_RULES.minLength, PASSWORD_RULES.messages.minLength)
  .regex(PASSWORD_RULES.patterns.uppercase, PASSWORD_RULES.messages.uppercase)
  .regex(PASSWORD_RULES.patterns.lowercase, PASSWORD_RULES.messages.lowercase)
  .regex(PASSWORD_RULES.patterns.digit, PASSWORD_RULES.messages.digit)
  .regex(PASSWORD_RULES.patterns.specialChar, PASSWORD_RULES.messages.specialChar);

/**
 * Zod schema for confirm password (to be used with .refine)
 */
export const confirmPasswordSchema = z.string();

/**
 * Helper: Add password confirmation refinement to a schema object
 */
export function withPasswordConfirmation<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  passwordField: string = 'password',
  confirmField: string = 'confirm_password',
) {
  return schema.refine(
    (data: any) => data[passwordField] === data[confirmField],
    {
      message: PASSWORD_RULES.messages.confirmMismatch,
      path: [confirmField],
    },
  );
}
