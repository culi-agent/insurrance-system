import api from '@/lib/api';
import type {
  MotorQuoteInput,
  QuickQuoteResponse,
  MultiInsurerQuoteResponse,
} from '@/types/quotation';

export const quotationService = {
  /**
   * Get a quick motor quote (no auth required)
   */
  getQuickQuote: async (input: MotorQuoteInput): Promise<QuickQuoteResponse> => {
    const response = await api.post('/quotations/motor/quick', input);
    return response.data.data;
  },

  /**
   * Get multi-insurer comparison quotes (no auth required)
   */
  getComparisonQuotes: async (input: MotorQuoteInput): Promise<MultiInsurerQuoteResponse> => {
    const response = await api.post('/quotations/motor/compare', input);
    return response.data.data;
  },

  /**
   * Create and save a motor quote (requires auth)
   */
  createMotorQuote: async (input: MotorQuoteInput) => {
    const response = await api.post('/quotations/motor', input);
    return response.data.data;
  },

  /**
   * Get saved quotation by ID (requires auth)
   */
  getQuotationById: async (id: string) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data.data;
  },

  /**
   * Get customer's quotation history (requires auth)
   */
  getMyQuotations: async (page = 1, perPage = 10) => {
    const response = await api.get(`/quotations/my?page=${page}&per_page=${perPage}`);
    return response.data.data;
  },

  /**
   * Accept a quotation (requires auth)
   */
  acceptQuote: async (quoteId: string) => {
    const response = await api.post(`/quotations/${quoteId}/accept`);
    return response.data.data;
  },
};
