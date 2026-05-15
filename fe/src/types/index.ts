// ============ Auth Types ============
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  kyc_status: string;
  date_of_birth?: string;
  gender?: string;
  address?: Record<string, any>;
  email_verified?: boolean;
  phone_verified?: boolean;
  language?: string;
  created_at?: string;
}

export interface LoginRequest {
  email_or_phone: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  full_name: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  is_new_user?: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  channel: string;
}

export interface ForgotPasswordRequest {
  email_or_phone: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  id_number?: string;
  id_number_type?: string;
  address?: Record<string, any>;
  avatar_url?: string;
  language?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ============ Product Types ============
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
}

export interface Insurer {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  benefits?: any;
  exclusions?: any;
  pricing_rules?: any;
  eligibility?: any;
  terms_url?: string;
  brochure_url?: string;
  min_age?: number;
  max_age?: number;
  min_premium?: number;
  max_premium?: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  category?: { id: string; name: string; slug: string };
  insurer?: { id: string; name: string; slug?: string; logo_url?: string };
  metadata?: any;
  created_at?: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  per_page: number;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string; code: string }>;
  };
}


// ============ Re-export Quotation Types ============
export type {
  MotorQuoteInput,
  QuickQuoteResponse,
  MultiInsurerQuoteResponse,
  InsurerQuote,
  CoverageDetail,
  QuoteStep,
} from './quotation';
