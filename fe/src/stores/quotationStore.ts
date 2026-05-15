import { create } from 'zustand';
import type {
  MotorQuoteInput,
  QuoteStep,
  QuickQuoteResponse,
  MultiInsurerQuoteResponse,
} from '@/types/quotation';
import { quotationService } from '@/services/quotationService';

interface QuotationState {
  // Form state
  currentStep: QuoteStep;
  formData: Partial<MotorQuoteInput>;

  // Quote results
  quickQuote: QuickQuoteResponse | null;
  comparisonQuotes: MultiInsurerQuoteResponse | null;

  // Loading states
  isLoadingQuick: boolean;
  isLoadingComparison: boolean;
  error: string | null;

  // Actions
  setStep: (step: QuoteStep) => void;
  setFormData: (data: Partial<MotorQuoteInput>) => void;
  resetForm: () => void;
  fetchQuickQuote: () => Promise<void>;
  fetchComparisonQuotes: () => Promise<void>;
}

const defaultFormData: Partial<MotorQuoteInput> = {
  vehicle_type: 'car',
  vehicle_year: new Date().getFullYear(),
  seats: 5,
  usage: 'personal',
  coverage_type: 'both',
  coverage_duration: 12,
  additional_coverage: {
    passenger_accident: false,
    flood_damage: false,
    scratch_damage: false,
    theft: false,
  },
  no_claims_years: 0,
  has_garage: false,
  has_dashcam: false,
};

export const useQuotationStore = create<QuotationState>((set, get) => ({
  currentStep: 'vehicle',
  formData: { ...defaultFormData },
  quickQuote: null,
  comparisonQuotes: null,
  isLoadingQuick: false,
  isLoadingComparison: false,
  error: null,

  setStep: (step) => set({ currentStep: step }),

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () =>
    set({
      currentStep: 'vehicle',
      formData: { ...defaultFormData },
      quickQuote: null,
      comparisonQuotes: null,
      error: null,
    }),

  fetchQuickQuote: async () => {
    const { formData } = get();
    set({ isLoadingQuick: true, error: null });
    try {
      const result = await quotationService.getQuickQuote(formData as MotorQuoteInput);
      set({ quickQuote: result, isLoadingQuick: false });
    } catch (err: any) {
      set({
        isLoadingQuick: false,
        error: err.response?.data?.error?.message || 'Lỗi khi tính báo giá',
      });
    }
  },

  fetchComparisonQuotes: async () => {
    const { formData } = get();
    set({ isLoadingComparison: true, error: null });
    try {
      const result = await quotationService.getComparisonQuotes(formData as MotorQuoteInput);
      set({ comparisonQuotes: result, isLoadingComparison: false, currentStep: 'comparison' });
    } catch (err: any) {
      set({
        isLoadingComparison: false,
        error: err.response?.data?.error?.message || 'Lỗi khi lấy báo giá từ nhà bảo hiểm',
      });
    }
  },
}));
