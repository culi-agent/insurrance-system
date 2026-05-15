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

export const socialLoginSchema = Joi.object({
  provider: Joi.string().valid('google', 'facebook').required().messages({
    'any.required': 'Provider là bắt buộc',
    'any.only': 'Provider phải là google hoặc facebook',
  }),
  token: Joi.string().required().messages({
    'any.required': 'Token là bắt buộc',
  }),
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
  email: Joi.string().email().required().messages({
    'any.required': 'Email là bắt buộc',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP phải có 6 ký tự',
    'any.required': 'OTP là bắt buộc',
  }),
  new_password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password phải >= 8 ký tự',
      'string.pattern.base': 'Password phải có chữ hoa, số, và ký tự đặc biệt',
      'any.required': 'Password mới là bắt buộc',
    }),
  confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    'any.only': 'Confirm password không khớp',
    'any.required': 'Confirm password là bắt buộc',
  }),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Mật khẩu hiện tại là bắt buộc',
  }),
  new_password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password phải >= 8 ký tự',
      'string.pattern.base': 'Password phải có chữ hoa, số, và ký tự đặc biệt',
      'any.required': 'Password mới là bắt buộc',
    }),
  confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    'any.only': 'Confirm password không khớp',
    'any.required': 'Confirm password là bắt buộc',
  }),
});

export const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  date_of_birth: Joi.string().isoDate().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  id_number: Joi.string().max(20).optional(),
  id_number_type: Joi.string().valid('cccd', 'cmnd', 'passport').optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    ward: Joi.string().optional(),
    district: Joi.string().optional(),
    city: Joi.string().optional(),
    province: Joi.string().optional(),
  }).optional(),
  avatar_url: Joi.string().uri().allow('').optional(),
  language: Joi.string().valid('vi', 'en').optional(),
}).min(1);

export const resendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email là bắt buộc',
  }),
  type: Joi.string().valid('verify', 'reset').required().messages({
    'any.required': 'Loại OTP là bắt buộc',
    'any.only': 'Loại OTP phải là verify hoặc reset',
  }),
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'Refresh token là bắt buộc',
  }),
});
