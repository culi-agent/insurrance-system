import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate, validateQuery } from '../../../src/shared/middleware/validate';
import { ValidationError } from '../../../src/shared/errors/AppError';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validate (body)', () => {
    const testSchema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      age: Joi.number().integer().min(18).optional(),
    });

    it('should call next() for valid body data', () => {
      mockReq.body = { name: 'John Doe', email: 'john@example.com' };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with ValidationError for invalid data', () => {
      mockReq.body = { name: 'Jo', email: 'not-email' };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should include field details in ValidationError', () => {
      mockReq.body = { name: 'Jo', email: 'invalid' };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details!.length).toBeGreaterThan(0);
      expect(error.details![0]).toHaveProperty('field');
      expect(error.details![0]).toHaveProperty('message');
      expect(error.details![0]).toHaveProperty('code', 'INVALID_FIELD');
    });

    it('should report all validation errors (abortEarly: false)', () => {
      mockReq.body = {}; // Missing both required fields

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details!.length).toBeGreaterThanOrEqual(2);
    });

    it('should strip unknown fields', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'should be stripped',
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle optional fields correctly', () => {
      mockReq.body = { name: 'John Doe', email: 'john@example.com', age: 25 };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail when optional field has invalid value', () => {
      mockReq.body = { name: 'John Doe', email: 'john@example.com', age: 10 };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details!.some((d) => d.field === 'age')).toBe(true);
    });
  });

  describe('validateQuery', () => {
    const querySchema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      per_page: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().optional(),
    });

    it('should call next() for valid query params', () => {
      mockReq.query = { page: '2', per_page: '10' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set defaults for missing query params', () => {
      mockReq.query = {};

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query).toEqual({ page: 1, per_page: 20 });
    });

    it('should call next with ValidationError for invalid query', () => {
      mockReq.query = { page: '-1' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should strip unknown query params', () => {
      mockReq.query = { page: '1', unknown: 'value' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query).not.toHaveProperty('unknown');
    });
  });
});
