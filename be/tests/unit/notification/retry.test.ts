import { withRetry, RetryResult } from '../../../src/shared/services/notification/retry';
import { RetryConfig } from '../../../src/shared/services/notification/notification.config';

// Mock logger
jest.mock('../../../src/shared/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('withRetry', () => {
  const fastConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 10,
    maxDelay: 50,
    backoffMultiplier: 2,
  };

  it('should succeed on first attempt without retry', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await withRetry(fn, fastConfig, 'test-op');

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on 2nd attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockResolvedValue('recovered');

    const result = await withRetry(fn, fastConfig, 'test-op');

    expect(result.success).toBe(true);
    expect(result.result).toBe('recovered');
    expect(result.attempts).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on failure and succeed on 3rd attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))
      .mockResolvedValue('recovered-late');

    const result = await withRetry(fn, fastConfig, 'test-op');

    expect(result.success).toBe(true);
    expect(result.result).toBe('recovered-late');
    expect(result.attempts).toBe(3);
  });

  it('should fail after exhausting all retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('persistent failure'));

    const result = await withRetry(fn, fastConfig, 'test-op');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('persistent failure');
    expect(result.attempts).toBe(4); // 1 initial + 3 retries
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('should not retry when maxRetries is 0', async () => {
    const noRetryConfig: RetryConfig = { ...fastConfig, maxRetries: 0 };
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    const result = await withRetry(fn, noRetryConfig, 'test-op');

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error exceptions', async () => {
    const fn = jest.fn().mockRejectedValue('string error');

    const result = await withRetry(fn, { ...fastConfig, maxRetries: 0 }, 'test-op');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('string error');
  });

  it('should apply exponential backoff delays', async () => {
    const startTime = Date.now();
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValue('ok');

    await withRetry(fn, { ...fastConfig, initialDelay: 50, backoffMultiplier: 2 }, 'test-op');

    const elapsed = Date.now() - startTime;
    // Should have waited at least 50ms (first retry) + some time for second
    expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some timing slack
  });

  it('should cap delay at maxDelay', async () => {
    const cappedConfig: RetryConfig = {
      maxRetries: 5,
      initialDelay: 100,
      maxDelay: 100, // Same as initial, so never increases
      backoffMultiplier: 10,
    };
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValue('ok');

    const startTime = Date.now();
    await withRetry(fn, cappedConfig, 'test-op');
    const elapsed = Date.now() - startTime;

    // Both delays should be capped at 100ms (not 100 then 1000)
    expect(elapsed).toBeLessThan(500);
  });
});
