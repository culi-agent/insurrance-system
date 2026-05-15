import { logger } from '../../utils/logger';
import { RetryConfig } from './notification.config';

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
}

/**
 * Execute a function with exponential backoff retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  context: string = 'operation',
): Promise<RetryResult<T>> {
  let lastError: Error | undefined;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info(`[Retry] ${context} succeeded on attempt ${attempt}`);
      }
      return { success: true, result, attempts: attempt };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt <= config.maxRetries) {
        logger.warn(
          `[Retry] ${context} failed on attempt ${attempt}/${config.maxRetries + 1}: ${lastError.message}. Retrying in ${delay}ms...`,
        );
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      } else {
        logger.error(
          `[Retry] ${context} failed after ${attempt} attempts: ${lastError.message}`,
        );
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: config.maxRetries + 1,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
