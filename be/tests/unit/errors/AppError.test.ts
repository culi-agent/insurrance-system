import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  AccountLockedError,
} from '../../../src/shared/errors/AppError';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 500, 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeUndefined();
    });

    it('should accept optional details array', () => {
      const details = [{ field: 'email', message: 'Invalid email', code: 'INVALID' }];
      const error = new AppError('Validation failed', 400, 'VALIDATION', details);
      expect(error.details).toEqual(details);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test', 500, 'TEST');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ValidationError', () => {
    it('should have status 400 and VALIDATION_ERROR code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    it('should accept details', () => {
      const details = [{ field: 'name', message: 'Required', code: 'REQUIRED' }];
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status 401 and default message', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should have status 403', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should have status 404', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should have status 409', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('TooManyRequestsError', () => {
    it('should have status 429', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('TOO_MANY_REQUESTS');
    });
  });

  describe('AccountLockedError', () => {
    it('should have status 423', () => {
      const error = new AccountLockedError();
      expect(error.statusCode).toBe(423);
      expect(error.code).toBe('ACCOUNT_LOCKED');
      expect(error.message).toBe('Account is locked');
    });

    it('should accept custom message', () => {
      const error = new AccountLockedError('Locked for 30 minutes');
      expect(error.message).toBe('Locked for 30 minutes');
    });
  });
});
