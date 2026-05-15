import { BaseInsurerAdapter, QuoteRequest, QuoteResponse, InsurerHealth } from './adapters/base.adapter';
import { BaoVietAdapter } from './adapters/bao-viet.adapter';
import { PviAdapter } from './adapters/pvi.adapter';
import { BaoMinhAdapter } from './adapters/bao-minh.adapter';
import { ManulifeAdapter } from './adapters/manulife.adapter';
import { DaiIchiAdapter } from './adapters/dai-ichi.adapter';
import { logger } from '../../shared/utils/logger';

/**
 * Insurer Integration Registry
 * Sprint 2: S2-10
 *
 * Central registry for managing insurer adapter instances.
 * Provides multi-insurer quoting and health monitoring.
 */
export class InsurerRegistry {
  private static instance: InsurerRegistry;
  private adapters: Map<string, BaseInsurerAdapter> = new Map();

  private constructor() {
    // Register all available adapters
    this.registerAdapter(new BaoVietAdapter());
    this.registerAdapter(new PviAdapter());
    this.registerAdapter(new BaoMinhAdapter());
    this.registerAdapter(new ManulifeAdapter());
    this.registerAdapter(new DaiIchiAdapter());
  }

  static getInstance(): InsurerRegistry {
    if (!InsurerRegistry.instance) {
      InsurerRegistry.instance = new InsurerRegistry();
    }
    return InsurerRegistry.instance;
  }

  /**
   * Register a new insurer adapter
   */
  registerAdapter(adapter: BaseInsurerAdapter): void {
    this.adapters.set(adapter.insurerCode, adapter);
    logger.info(`[Registry] Registered insurer adapter: ${adapter.insurerName} (${adapter.insurerCode})`);
  }

  /**
   * Get adapter by insurer code
   */
  getAdapter(insurerCode: string): BaseInsurerAdapter | undefined {
    return this.adapters.get(insurerCode);
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): BaseInsurerAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get adapters that support a specific insurance type
   */
  getAdaptersForType(insuranceType: string): BaseInsurerAdapter[] {
    return this.getAllAdapters().filter((adapter) => adapter.supportsType(insuranceType));
  }

  /**
   * Get quotes from all insurers that support the given type
   * Returns quotes sorted by total_premium (cheapest first)
   */
  async getMultiInsurerQuotes(request: QuoteRequest): Promise<{
    quotes: QuoteResponse[];
    errors: Array<{ insurer_code: string; error: string }>;
  }> {
    const adapters = this.getAdaptersForType(request.insurance_type);

    if (adapters.length === 0) {
      return { quotes: [], errors: [{ insurer_code: 'none', error: `No insurer supports ${request.insurance_type}` }] };
    }

    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.getQuote(request)),
    );

    const quotes: QuoteResponse[] = [];
    const errors: Array<{ insurer_code: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        quotes.push(result.value);
      } else {
        errors.push({
          insurer_code: adapters[index].insurerCode,
          error: result.reason?.message || 'Unknown error',
        });
        logger.error(`[Registry] Quote error from ${adapters[index].insurerCode}:`, result.reason);
      }
    });

    // Sort by total premium (cheapest first)
    quotes.sort((a, b) => a.total_premium - b.total_premium);

    return { quotes, errors };
  }

  /**
   * Health check all registered insurers
   */
  async checkAllHealth(): Promise<Record<string, InsurerHealth>> {
    const healthResults: Record<string, InsurerHealth> = {};

    const results = await Promise.allSettled(
      this.getAllAdapters().map(async (adapter) => ({
        code: adapter.insurerCode,
        health: await adapter.healthCheck(),
      })),
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        healthResults[result.value.code] = result.value.health;
      }
    });

    return healthResults;
  }

  /**
   * Get list of available insurers
   */
  getAvailableInsurers() {
    return this.getAllAdapters().map((adapter) => ({
      code: adapter.insurerCode,
      name: adapter.insurerName,
      supported_types: adapter.supportedTypes,
    }));
  }
}
