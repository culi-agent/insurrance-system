import api from '@/lib/api';
import type {
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '@/types';

export interface LoginResponse {
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  token_type: string;
  expires_in: number;
}

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data.data;
  },

  resendOtp: async (data: { email: string; type: 'verify' | 'reset' }) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  socialLogin: async (data: SocialLoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/social-login', data);
    return response.data.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post('/auth/change-password', data);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data.data;
  },

  refreshToken: async (): Promise<RefreshResponse> => {
    // Refresh token is automatically sent via HttpOnly cookie
    const response = await api.post('/auth/refresh-token');
    return response.data.data;
  },
};
