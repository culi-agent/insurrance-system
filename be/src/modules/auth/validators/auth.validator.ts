import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email format không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  phone: Joi.string()
    .pattern(/^\+84[0-9]{9,10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại phải có format +84xxxxxxxxx',
      'any.required': 'Số điện thoại là bắt buộc',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password phải >= 8 ký tự',
      'string.pattern.base': 'Password phải có chữ hoa, số, và ký tự đặc biệt',
      'any.required': 'Password là bắt buộc',
    }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password không khớp',
    'any.required': 'Confirm password là bắt buộc',
  }),
  full_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Họ tên phải >= 2 ký tự',
    'any.required': 'Họ tên là bắt buộc',
  }),
  agree_terms: Joi.boolean().valid(true).required().messages({
    'any.only': 'Bạn phải đồng ý với điều khoản dịch vụ',
    'any.required': 'Bạn phải đồng ý với điều khoản dịch vụ',
  }),
});

export const loginSchema = Joi.object({
  email_or_phone: Joi.string().required().messages({
    'any.required': 'Email hoặc số điện thoại là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password là bắt buộc',
  }),
  remember_me: Joi.boolean().default(false),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP phải có 6 ký tự',
    'any.required': 'OTP là bắt buộc',
  }),
  channel: Joi.string().valid('email', 'sms').default('email'),
});

export const forgotPasswordSchema = Joi.object({
  email_or_phone: Joi.string().required().messages({
    'any.required': 'Email hoặc số điện thoại là bắt buộc',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password phải >= 8 ký tự',
      'string.pattern.base': 'Password phải có chữ hoa, số, và ký tự đặc biệt',
    }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'Refresh token là bắt buộc',
  }),
});
