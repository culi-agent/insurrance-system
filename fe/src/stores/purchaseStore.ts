import { create } from 'zustand';
import type { PurchaseOrder, PurchaseWizardStep, ApplicantInfo, BeneficiaryInfo, EkycResult, UnderwritingResult } from '@/types/purchase';

interface PurchaseState {
  // Current order
  currentOrder: PurchaseOrder | null;
  currentStep: PurchaseWizardStep;
  
  // Form data
  applicantInfo: Partial<ApplicantInfo>;
  beneficiaries: BeneficiaryInfo[];
  
  // Process results
  ekycResult: EkycResult | null;
  underwritingResult: UnderwritingResult | null;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setCurrentOrder: (order: PurchaseOrder) => void;
  setStep: (step: PurchaseWizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setApplicantInfo: (info: Partial<ApplicantInfo>) => void;
  addBeneficiary: (beneficiary: BeneficiaryInfo) => void;
  removeBeneficiary: (index: number) => void;
  updateBeneficiary: (index: number, data: Partial<BeneficiaryInfo>) => void;
  setEkycResult: (result: EkycResult) => void;
  setUnderwritingResult: (result: UnderwritingResult) => void;
  setLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const STEPS: PurchaseWizardStep[] = ['applicant', 'beneficiary', 'ekyc', 'review', 'payment'];

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  currentOrder: null,
  currentStep: 'applicant',
  applicantInfo: {},
  beneficiaries: [],
  ekycResult: null,
  underwritingResult: null,
  isLoading: false,
  isProcessing: false,
  error: null,

  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep } = get();
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      set({ currentStep: STEPS[idx + 1] });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      set({ currentStep: STEPS[idx - 1] });
    }
  },
  
  setApplicantInfo: (info) =>
    set((state) => ({ applicantInfo: { ...state.applicantInfo, ...info } })),
  
  addBeneficiary: (beneficiary) =>
    set((state) => ({ beneficiaries: [...state.beneficiaries, beneficiary] })),
  
  removeBeneficiary: (index) =>
    set((state) => ({
      beneficiaries: state.beneficiaries.filter((_, i) => i !== index),
    })),
  
  updateBeneficiary: (index, data) =>
    set((state) => ({
      beneficiaries: state.beneficiaries.map((b, i) =>
        i === index ? { ...b, ...data } : b,
      ),
    })),
  
  setEkycResult: (result) => set({ ekycResult: result }),
  setUnderwritingResult: (result) => set({ underwritingResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  
  reset: () =>
    set({
      currentOrder: null,
      currentStep: 'applicant',
      applicantInfo: {},
      beneficiaries: [],
      ekycResult: null,
      underwritingResult: null,
      isLoading: false,
      isProcessing: false,
      error: null,
    }),
}));
