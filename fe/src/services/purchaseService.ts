import api from '@/lib/api';
import type { PurchaseOrder, EkycResult, UnderwritingResult, PaymentInitResult, Policy } from '@/types/purchase';

export const purchaseService = {
  // Create order from quotation
  createOrder: async (data: {
    quotation_id: string;
    applicant_info: Record<string, any>;
    beneficiary_info?: Array<Record<string, any>>;
  }): Promise<PurchaseOrder> => {
    const response = await api.post('/purchase/orders', data);
    return response.data.data;
  },

  // Get order detail
  getOrder: async (orderId: string): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchase/orders/${orderId}`);
    return response.data.data;
  },

  // Get my orders
  getMyOrders: async (page = 1, perPage = 10): Promise<{ data: PurchaseOrder[]; total: number }> => {
    const response = await api.get('/purchase/orders', { params: { page, per_page: perPage } });
    return response.data.data;
  },

  // Update wizard step
  updateWizardStep: async (orderId: string, step: number, data: Record<string, any>): Promise<PurchaseOrder> => {
    const response = await api.put(`/purchase/orders/${orderId}/wizard`, { step, data });
    return response.data.data;
  },

  // Perform eKYC
  performEkyc: async (orderId: string, data: {
    id_card_front_image: string;
    id_card_back_image: string;
    selfie_image?: string;
  }): Promise<EkycResult> => {
    const response = await api.post(`/purchase/orders/${orderId}/ekyc`, data);
    return response.data.data;
  },

  // Run underwriting
  runUnderwriting: async (orderId: string): Promise<UnderwritingResult> => {
    const response = await api.post(`/purchase/orders/${orderId}/underwriting`);
    return response.data.data;
  },

  // Initiate payment
  initiatePayment: async (orderId: string, data: {
    payment_method: string;
    return_url: string;
    notify_url?: string;
  }): Promise<PaymentInitResult> => {
    const response = await api.post(`/purchase/orders/${orderId}/payment`, data);
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/purchase/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  },

  // Get my policies
  getMyPolicies: async (page = 1, perPage = 10, status?: string): Promise<{ data: Policy[]; total: number }> => {
    const params: Record<string, any> = { page, per_page: perPage };
    if (status) params.status = status;
    const response = await api.get('/purchase/policies', { params });
    return response.data.data;
  },

  // Get policy detail
  getPolicyDetail: async (policyId: string): Promise<Policy> => {
    const response = await api.get(`/purchase/policies/${policyId}`);
    return response.data.data;
  },
};
