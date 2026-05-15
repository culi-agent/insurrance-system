import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Tên sản phẩm là bắt buộc',
    'string.min': 'Tên sản phẩm phải >= 3 ký tự',
  }),
  slug: Joi.string().min(3).max(200).required().pattern(/^[a-z0-9-]+$/).messages({
    'any.required': 'Slug là bắt buộc',
    'string.pattern.base': 'Slug chỉ chứa chữ thường, số và dấu gạch ngang',
  }),
  category_id: Joi.string().uuid().required().messages({
    'any.required': 'Danh mục là bắt buộc',
  }),
  insurer_id: Joi.string().uuid().required().messages({
    'any.required': 'Nhà bảo hiểm là bắt buộc',
  }),
  description: Joi.string().allow('').optional(),
  short_description: Joi.string().max(500).allow('').optional(),
  benefits: Joi.array().items(Joi.object()).optional(),
  exclusions: Joi.array().items(Joi.object()).optional(),
  pricing_rules: Joi.object().optional(),
  eligibility: Joi.object().optional(),
  terms_url: Joi.string().uri().allow('').optional(),
  brochure_url: Joi.string().uri().allow('').optional(),
  min_age: Joi.number().integer().min(0).max(100).optional(),
  max_age: Joi.number().integer().min(0).max(100).optional(),
  min_premium: Joi.number().min(0).optional(),
  max_premium: Joi.number().min(0).optional(),
  status: Joi.string().valid('draft', 'active', 'suspended', 'archived').optional(),
  sort_order: Joi.number().integer().optional(),
  is_featured: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  slug: Joi.string().min(3).max(200).pattern(/^[a-z0-9-]+$/).optional(),
  category_id: Joi.string().uuid().optional(),
  insurer_id: Joi.string().uuid().optional(),
  description: Joi.string().allow('').optional(),
  short_description: Joi.string().max(500).allow('').optional(),
  benefits: Joi.array().items(Joi.object()).optional(),
  exclusions: Joi.array().items(Joi.object()).optional(),
  pricing_rules: Joi.object().optional(),
  eligibility: Joi.object().optional(),
  terms_url: Joi.string().uri().allow('').optional(),
  brochure_url: Joi.string().uri().allow('').optional(),
  min_age: Joi.number().integer().min(0).max(100).optional(),
  max_age: Joi.number().integer().min(0).max(100).optional(),
  min_premium: Joi.number().min(0).optional(),
  max_premium: Joi.number().min(0).optional(),
  status: Joi.string().valid('draft', 'active', 'suspended', 'archived').optional(),
  sort_order: Joi.number().integer().optional(),
  is_featured: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
}).min(1);

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Tên danh mục là bắt buộc',
  }),
  slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).required().messages({
    'any.required': 'Slug là bắt buộc',
    'string.pattern.base': 'Slug chỉ chứa chữ thường, số và dấu gạch ngang',
  }),
  description: Joi.string().allow('').optional(),
  icon: Joi.string().max(50).optional(),
  parent_id: Joi.string().uuid().allow(null).optional(),
  sort_order: Joi.number().integer().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).optional(),
  description: Joi.string().allow('').optional(),
  icon: Joi.string().max(50).optional(),
  parent_id: Joi.string().uuid().allow(null).optional(),
  sort_order: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

export const createInsurerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Tên nhà bảo hiểm là bắt buộc',
  }),
  code: Joi.string().min(2).max(20).uppercase().required().messages({
    'any.required': 'Mã nhà bảo hiểm là bắt buộc',
  }),
  slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).required().messages({
    'any.required': 'Slug là bắt buộc',
  }),
  description: Joi.string().allow('').optional(),
  logo_url: Joi.string().allow('').optional(),
  website: Joi.string().uri().allow('').optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
  api_config: Joi.object().optional(),
});

export const updateInsurerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  code: Joi.string().min(2).max(20).uppercase().optional(),
  slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).optional(),
  description: Joi.string().allow('').optional(),
  logo_url: Joi.string().allow('').optional(),
  website: Joi.string().uri().allow('').optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
  api_config: Joi.object().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  rating: Joi.number().min(0).max(5).optional(),
}).min(1);

export const updateCustomerStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'suspended').required().messages({
    'any.required': 'Trạng thái là bắt buộc',
    'any.only': 'Trạng thái không hợp lệ',
  }),
});
