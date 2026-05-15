import Joi from 'joi';

export const motorQuoteSchema = Joi.object({
  vehicle_type: Joi.string()
    .valid('motorcycle', 'car', 'truck', 'bus')
    .required()
    .messages({ 'any.required': 'Loại xe là bắt buộc' }),
  brand: Joi.string().max(50).required().messages({ 'any.required': 'Hãng xe là bắt buộc' }),
  model: Joi.string().max(100).required().messages({ 'any.required': 'Dòng xe là bắt buộc' }),
  year: Joi.number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({ 'any.required': 'Năm sản xuất là bắt buộc' }),
  engine_cc: Joi.number().integer().min(50).max(10000).required()
    .messages({ 'any.required': 'Dung tích xi-lanh là bắt buộc' }),
  usage: Joi.string().valid('personal', 'commercial', 'rideshare').default('personal'),
  vehicle_value: Joi.number().min(1000000).required()
    .messages({ 'any.required': 'Giá trị xe là bắt buộc' }),
  license_plate: Joi.string().max(20).optional(),
  coverage_type: Joi.string()
    .valid('liability_only', 'comprehensive')
    .required()
    .messages({ 'any.required': 'Loại bảo hiểm là bắt buộc' }),
  sum_insured: Joi.number().min(0).optional(),
  add_passenger: Joi.boolean().default(false),
  passenger_seats: Joi.number().integer().min(0).max(50).default(1),
  deductible: Joi.number().min(0).default(0),
  start_date: Joi.string().isoDate().required()
    .messages({ 'any.required': 'Ngày bắt đầu là bắt buộc' }),
});

export const healthQuoteSchema = Joi.object({
  plan_type: Joi.string().valid('individual', 'family').required()
    .messages({ 'any.required': 'Loại gói là bắt buộc' }),
  date_of_birth: Joi.string().isoDate().required()
    .messages({ 'any.required': 'Ngày sinh là bắt buộc' }),
  gender: Joi.string().valid('male', 'female', 'other').required()
    .messages({ 'any.required': 'Giới tính là bắt buộc' }),
  occupation: Joi.string().max(100).default('office_worker'),
  smoking: Joi.boolean().default(false),
  height_cm: Joi.number().min(50).max(250).optional(),
  weight_kg: Joi.number().min(20).max(300).optional(),
  pre_existing_conditions: Joi.array().items(Joi.string()).default([]),
  hospitalized_last_5_years: Joi.boolean().default(false),
  sum_insured: Joi.number().min(50000000).required()
    .messages({ 'any.required': 'Mức bảo hiểm là bắt buộc' }),
  inpatient: Joi.boolean().default(true),
  outpatient: Joi.boolean().default(false),
  dental: Joi.boolean().default(false),
  maternity: Joi.boolean().default(false),
  critical_illness: Joi.boolean().default(false),
  deductible: Joi.number().min(0).default(0),
  copay: Joi.number().min(0).max(100).default(0),
  network: Joi.string().valid('standard', 'premium', 'global').default('standard'),
  start_date: Joi.string().isoDate().required()
    .messages({ 'any.required': 'Ngày bắt đầu là bắt buộc' }),
});

export const travelQuoteSchema = Joi.object({
  trip_type: Joi.string().valid('domestic', 'international').required()
    .messages({ 'any.required': 'Loại chuyến đi là bắt buộc' }),
  destination: Joi.string().max(100).required()
    .messages({ 'any.required': 'Điểm đến là bắt buộc' }),
  departure_date: Joi.string().isoDate().required()
    .messages({ 'any.required': 'Ngày khởi hành là bắt buộc' }),
  return_date: Joi.string().isoDate().required()
    .messages({ 'any.required': 'Ngày về là bắt buộc' }),
  travelers: Joi.array()
    .items(
      Joi.object({
        age: Joi.number().integer().min(0).max(100).required(),
        name: Joi.string().max(100).required(),
      }),
    )
    .min(1)
    .max(10)
    .required()
    .messages({ 'any.required': 'Thông tin người đi là bắt buộc' }),
  coverage_plan: Joi.string().valid('basic', 'standard', 'premium').default('standard'),
  activities: Joi.array().items(Joi.string()).default([]),
});
