import Joi from 'joi';

export const motorQuoteSchema = Joi.object({
  // Vehicle information
  vehicle_type: Joi.string().valid('car', 'motorcycle', 'truck', 'bus').required().messages({
    'any.required': 'Loại xe là bắt buộc',
    'any.only': 'Loại xe không hợp lệ',
  }),
  vehicle_brand: Joi.string().min(1).max(50).required().messages({
    'any.required': 'Hãng xe là bắt buộc',
  }),
  vehicle_model: Joi.string().min(1).max(50).required().messages({
    'any.required': 'Dòng xe là bắt buộc',
  }),
  vehicle_year: Joi.number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'any.required': 'Năm sản xuất là bắt buộc',
      'number.min': 'Năm sản xuất phải từ 1990',
    }),
  license_plate: Joi.string().min(5).max(15).required().messages({
    'any.required': 'Biển số xe là bắt buộc',
  }),
  engine_capacity: Joi.number().integer().min(50).max(20000).required().messages({
    'any.required': 'Dung tích động cơ là bắt buộc',
  }),
  vehicle_value: Joi.number().min(5000000).max(50000000000).required().messages({
    'any.required': 'Giá trị xe là bắt buộc',
    'number.min': 'Giá trị xe phải >= 5.000.000 VND',
  }),
  seats: Joi.number().integer().min(1).max(60).required().messages({
    'any.required': 'Số chỗ ngồi là bắt buộc',
  }),
  usage: Joi.string().valid('personal', 'commercial', 'taxi').required().messages({
    'any.required': 'Mục đích sử dụng là bắt buộc',
  }),

  // Owner information
  owner_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Tên chủ xe là bắt buộc',
  }),
  owner_id_number: Joi.string().max(20).optional(),
  owner_phone: Joi.string().max(20).optional(),

  // Coverage options
  coverage_type: Joi.string().valid('tnds', 'comprehensive', 'both').required().messages({
    'any.required': 'Loại bảo hiểm là bắt buộc',
    'any.only': 'Loại bảo hiểm không hợp lệ (tnds, comprehensive, both)',
  }),
  coverage_duration: Joi.number().valid(12, 24, 36).required().messages({
    'any.required': 'Thời hạn bảo hiểm là bắt buộc',
    'any.only': 'Thời hạn phải là 12, 24, hoặc 36 tháng',
  }),
  additional_coverage: Joi.object({
    passenger_accident: Joi.boolean().optional(),
    flood_damage: Joi.boolean().optional(),
    scratch_damage: Joi.boolean().optional(),
    theft: Joi.boolean().optional(),
  }).optional(),

  // Discount factors
  no_claims_years: Joi.number().integer().min(0).max(20).optional(),
  has_garage: Joi.boolean().optional(),
  has_dashcam: Joi.boolean().optional(),
});
