/**
 * Insurer API Integration Framework - Base Adapter
 * Sprint 2: S2-10
 *
 * Adapter pattern for integrating with multiple insurer APIs.
 * Each insurer implements this interface to provide a consistent
 * contract for quote generation, policy issuance, etc.
 */

export interface QuoteRequest {
  insurance_type: string;
  product_id: string;
  customer_info: {
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    id_number?: string;
  };
  coverage_options: Record<string, any>;
  input_data: Record<string, any>;
}

export interface QuoteResponse {
  insurer_code: string;
  insurer_name: string;
  product_name: string;
  quote_id?: string;
  base_premium: number;
  discount: number;
  tax: number;
  total_premium: number;
  premium_breakdown: PremiumBreakdown[];
  coverage_details: CoverageDetail[];
  valid_until: Date;
  metadata?: Record<string, any>;
}

export interface PremiumBreakdown {
  item: string;
  amount: number;
  description?: string;
}

export interface CoverageDetail {
  name: string;
  sum_insured: number;
  description?: string;
  sub_items?: Array<{ name: string; limit: number }>;
}

export interface PolicyRequest {
  quote_id: string;
  customer_info: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    id_number: string;
    address: string;
    phone: string;
    email: string;
  };
  payment_info: {
    method: string;
    transaction_id: string;
    amount: number;
  };
  start_date: string;
  end_date: string;
}

export interface PolicyResponse {
  policy_number: string;
  status: 'active' | 'pending' | 'failed';
  document_url?: string;
  effective_date: string;
  expiry_date: string;
  metadata?: Record<string, any>;
}

export interface ClaimRequest {
  policy_number: string;
  claim_type: string;
  incident_date: string;
  description: string;
  amount_claimed: number;
  documents: Array<{ type: string; url: string }>;
}

export interface ClaimResponse {
  claim_number: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  estimated_settlement?: number;
  message?: string;
}

export interface InsurerHealth {
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  last_checked: Date;
  message?: string;
}

/**
 * Abstract base class for insurer adapters
 */
export abstract class BaseInsurerAdapter {
  abstract readonly insurerCode: string;
  abstract readonly insurerName: string;
  abstract readonly supportedTypes: string[];

  /**
   * Generate a quote from the insurer
   */
  abstract getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  /**
   * Issue a policy after payment
   */
  abstract issuePolicy(request: PolicyRequest): Promise<PolicyResponse>;

  /**
   * Submit a claim
   */
  abstract submitClaim(request: ClaimRequest): Promise<ClaimResponse>;

  /**
   * Check insurer API health
   */
  abstract healthCheck(): Promise<InsurerHealth>;

  /**
   * Validate if this adapter supports the given insurance type
   */
  supportsType(insuranceType: string): boolean {
    return this.supportedTypes.includes(insuranceType);
  }
}
