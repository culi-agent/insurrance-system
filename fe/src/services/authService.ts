import api from '@/lib/api';
import type {
  AuthResponse,
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

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  socialLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
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

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
    return response.data.data;
  },
};
