import Joi from 'joi';

export const createOrderSchema = Joi.object({
  quotation_id: Joi.string().uuid().required().messages({
    'string.guid': 'ID báo giá không hợp lệ',
    'any.required': 'Vui lòng chọn báo giá',
  }),
  applicant_info: Joi.object({
    full_name: Joi.string().min(2).max(200).required(),
    id_number: Joi.string().pattern(/^\d{9,12}$/).required().messages({
      'string.pattern.base': 'Số CCCD/CMND phải là 9-12 chữ số',
    }),
    date_of_birth: Joi.string().isoDate().required(),
    gender: Joi.string().valid('Nam', 'Nữ', 'Khác').required(),
    phone: Joi.string().pattern(/^(0|\+84)\d{9,10}$/).required().messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),
    email: Joi.string().email().required(),
    address: Joi.string().min(5).max(500).required(),
    occupation: Joi.string().max(200).optional(),
  }).required(),
  beneficiary_info: Joi.array().items(
    Joi.object({
      full_name: Joi.string().min(2).max(200).required(),
      relationship: Joi.string().required(),
      id_number: Joi.string().pattern(/^\d{9,12}$/).required(),
      percentage: Joi.number().min(1).max(100).required(),
    })
  ).optional(),
});

export const updateWizardStepSchema = Joi.object({
  step: Joi.number().integer().min(1).max(5).required(),
  data: Joi.object().required(),
});

export const ekycSchema = Joi.object({
  id_card_front_image: Joi.string().required().messages({
    'any.required': 'Vui lòng cung cấp ảnh mặt trước CCCD',
  }),
  id_card_back_image: Joi.string().required().messages({
    'any.required': 'Vui lòng cung cấp ảnh mặt sau CCCD',
  }),
  selfie_image: Joi.string().optional(),
});

export const initiatePaymentSchema = Joi.object({
  payment_method: Joi.string().valid('vnpay', 'momo', 'bank_transfer', 'credit_card').required().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ',
    'any.required': 'Vui lòng chọn phương thức thanh toán',
  }),
  return_url: Joi.string().uri().required(),
  notify_url: Joi.string().uri().optional(),
});

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});
