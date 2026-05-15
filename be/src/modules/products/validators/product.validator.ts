import Joi from 'joi';

export const productListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  per_page: Joi.number().integer().min(1).max(100).default(20),
  category_id: Joi.string().uuid().optional(),
  insurer_id: Joi.string().uuid().optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  is_featured: Joi.string().valid('true', 'false').optional(),
  search: Joi.string().max(200).optional(),
  sort_by: Joi.string().valid('price', 'rating', 'newest').optional(),
});

export const productCompareSchema = Joi.object({
  ids: Joi.string().required().messages({
    'any.required': 'Product IDs là bắt buộc (comma-separated)',
  }),
});

export const productSearchSchema = Joi.object({
  q: Joi.string().min(1).max(200).required().messages({
    'any.required': 'Từ khóa tìm kiếm là bắt buộc',
    'string.min': 'Từ khóa phải có ít nhất 1 ký tự',
  }),
  page: Joi.number().integer().min(1).default(1),
  per_page: Joi.number().integer().min(1).max(100).default(20),
});
