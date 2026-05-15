import Joi from 'joi';

export const createPolicySchema = Joi.object({
  quote_id: Joi.string().uuid().required().messages({
    'any.required': 'Quote ID là bắt buộc',
  }),
  insured_info: Joi.object({
    full_name: Joi.string().max(100).required(),
    date_of_birth: Joi.string().isoDate().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    id_number: Joi.string().max(20).required(),
    id_type: Joi.string().valid('cccd', 'cmnd', 'passport').default('cccd'),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.object({
      street: Joi.string().required(),
      ward: Joi.string().optional(),
      district: Joi.string().required(),
      city: Joi.string().required(),
    }).required(),
  }).required().messages({ 'any.required': 'Thông tin người được bảo hiểm là bắt buộc' }),
  beneficiaries: Joi.array().items(
    Joi.object({
      full_name: Joi.string().max(100).required(),
      relationship: Joi.string().valid('spouse', 'child', 'parent', 'sibling', 'other').required(),
      date_of_birth: Joi.string().isoDate().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      id_number: Joi.string().max(20).optional(),
      phone: Joi.string().optional(),
      percentage: Joi.number().min(1).max(100).required(),
    }),
  ).optional(),
  payment_frequency: Joi.string()
    .valid('annual', 'semi_annual', 'quarterly', 'monthly')
    .default('annual'),
  start_date: Joi.string().isoDate().required().messages({
    'any.required': 'Ngày bắt đầu là bắt buộc',
  }),
});

export const cancelPolicySchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'any.required': 'Lý do hủy là bắt buộc',
    'string.min': 'Lý do hủy phải có ít nhất 10 ký tự',
  }),
});
