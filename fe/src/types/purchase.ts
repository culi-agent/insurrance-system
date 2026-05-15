export interface ApplicantInfo {
  full_name: string;
  id_number: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  occupation?: string;
}

export interface BeneficiaryInfo {
  full_name: string;
  relationship: string;
  id_number: string;
  percentage: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  insurance_type: string;
  current_step: number;
  total_steps: number;
  applicant_info: ApplicantInfo;
  beneficiary_info: BeneficiaryInfo[];
  ekyc_status: string;
  underwriting_status: string;
  premium: {
    base: number;
    discount: number;
    tax: number;
    total: number;
  };
  status: string;
  status_history: Array<{ status: string; timestamp: string; note?: string }>;
  created_at: string;
  updated_at: string;
}

export interface EkycResult {
  order_id: string;
  ekyc_status: string;
  verification_id: string;
  confidence_score: number;
  extracted_data: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    place_of_origin: string;
    place_of_residence: string;
    expiry_date: string;
    issue_date: string;
    issued_by: string;
  };
  face_match?: {
    score: number;
    matched: boolean;
  };
}

export interface UnderwritingResult {
  order_id: string;
  underwriting_decision: 'auto_approved' | 'referred' | 'declined';
  risk_score: number;
  risk_level: string;
  reasons: string[];
  conditions?: string[];
  premium_adjustment?: number;
  total_amount: number;
}

export interface PaymentInitResult {
  payment_id: string;
  payment_number: string;
  payment_url: string;
  gateway: string;
  amount: number;
  expires_at: string;
  status: string;
}

export interface Policy {
  id: string;
  policy_number: string;
  insurance_type: string;
  plan_name: string;
  insured_info: ApplicantInfo;
  beneficiary_info: BeneficiaryInfo[];
  coverage_details: {
    type: string;
    sum_insured: number;
    coverage_items: Array<{ name: string; limit: number; description?: string }>;
  };
  premium_amount: number;
  payment_frequency: string;
  effective_date: string;
  expiry_date: string;
  issued_date: string;
  policy_document_url?: string;
  certificate_url?: string;
  status: string;
  signature_status: string;
  created_at: string;
}

export type PurchaseWizardStep = 'applicant' | 'beneficiary' | 'ekyc' | 'review' | 'payment';
