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


export const travelQuoteSchema = Joi.object({
  // Trip information
  trip_type: Joi.string().valid('single', 'annual').required().messages({
    'any.required': 'Loại chuyến đi là bắt buộc',
    'any.only': 'Loại chuyến đi không hợp lệ',
  }),
  destination_type: Joi.string().valid('domestic', 'asia', 'worldwide').required().messages({
    'any.required': 'Khu vực đến là bắt buộc',
  }),
  destination_country: Joi.string().max(100).optional(),
  departure_date: Joi.string().isoDate().required().messages({
    'any.required': 'Ngày khởi hành là bắt buộc',
  }),
  return_date: Joi.string().isoDate().required().messages({
    'any.required': 'Ngày về là bắt buộc',
  }),
  trip_purpose: Joi.string().valid('leisure', 'business', 'study', 'work').required().messages({
    'any.required': 'Mục đích chuyến đi là bắt buộc',
  }),

  // Travelers
  travelers: Joi.array().items(
    Joi.object({
      full_name: Joi.string().min(2).max(200).required(),
      date_of_birth: Joi.string().isoDate().required(),
      id_number: Joi.string().optional(),
      is_primary: Joi.boolean().required(),
    })
  ).min(1).max(20).required().messages({
    'array.min': 'Cần ít nhất 1 người đi',
    'array.max': 'Tối đa 20 người đi',
  }),

  // Coverage options
  plan_type: Joi.string().valid('basic', 'standard', 'premium').required().messages({
    'any.required': 'Gói bảo hiểm là bắt buộc',
  }),
  coverage_options: Joi.object({
    medical_expense: Joi.boolean().default(true),
    trip_cancellation: Joi.boolean().default(false),
    trip_delay: Joi.boolean().default(true),
    baggage_loss: Joi.boolean().default(true),
    personal_accident: Joi.boolean().default(true),
    personal_liability: Joi.boolean().default(true),
    emergency_evacuation: Joi.boolean().default(true),
    flight_delay_compensation: Joi.boolean().default(false),
  }).required(),

  // Contact info
  contact_name: Joi.string().min(2).max(200).required(),
  contact_phone: Joi.string().max(20).optional(),
  contact_email: Joi.string().email().optional(),
});


export const healthQuoteSchema = Joi.object({
  plan_type: Joi.string().valid('basic', 'standard', 'premium', 'platinum').required(),
  coverage_type: Joi.string().valid('inpatient', 'outpatient', 'comprehensive').required(),

  applicant: Joi.object({
    full_name: Joi.string().min(2).max(200).required(),
    date_of_birth: Joi.string().isoDate().required(),
    gender: Joi.string().valid('male', 'female').required(),
    occupation: Joi.string().min(2).max(200).required(),
    id_number: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
  }).required(),

  is_family_plan: Joi.boolean().required(),
  family_members: Joi.array().items(
    Joi.object({
      full_name: Joi.string().min(2).max(200).required(),
      date_of_birth: Joi.string().isoDate().required(),
      gender: Joi.string().valid('male', 'female').required(),
      relationship: Joi.string().valid('spouse', 'child', 'parent').required(),
    })
  ).optional(),

  health_declaration: Joi.object({
    height_cm: Joi.number().min(50).max(250).required(),
    weight_kg: Joi.number().min(10).max(300).required(),
    is_smoker: Joi.boolean().required(),
    is_drinker: Joi.boolean().required(),
    has_pre_existing_conditions: Joi.boolean().required(),
    pre_existing_conditions: Joi.array().items(Joi.string()).optional(),
    has_hospitalized_last_5years: Joi.boolean().required(),
    hospitalization_details: Joi.string().optional(),
    is_on_medication: Joi.boolean().required(),
    medication_details: Joi.string().optional(),
    has_family_history: Joi.boolean().required(),
    family_history_conditions: Joi.array().items(Joi.string()).optional(),
  }).required(),

  coverage_options: Joi.object({
    annual_limit: Joi.number().min(100000000).required(),
    deductible: Joi.number().min(0).required(),
    room_type: Joi.string().valid('standard', 'deluxe', 'vip').required(),
    include_dental: Joi.boolean().required(),
    include_maternity: Joi.boolean().required(),
    include_outpatient: Joi.boolean().required(),
    include_wellness: Joi.boolean().required(),
    geographic_coverage: Joi.string().valid('vietnam', 'asia', 'worldwide').required(),
  }).required(),

  coverage_duration: Joi.number().valid(12).default(12),
});
