import { Request } from 'express';

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export type UserRole = 'customer' | 'admin' | 'partner';
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'deleted';
export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type ProductStatus = 'draft' | 'active' | 'suspended' | 'archived';
