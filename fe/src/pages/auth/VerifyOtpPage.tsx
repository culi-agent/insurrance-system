import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const schema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 ký tự'),
});

type OtpForm = z.infer<typeof schema>;

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email = (location.state as any)?.email || '';
  const type = (location.state as any)?.type || 'verify';

  const { register, handleSubmit, formState: { errors } } = useForm<OtpForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: OtpForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.verifyOtp({ email, otp: data.otp, channel: 'email' });
      if (response.access_token) {
        login(
          { id: '', email, full_name: '', role: 'customer', kyc_status: 'pending' },
          response.access_token,
          response.refresh_token,
        );
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp({ email, type });
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác thực OTP</h2>
      <p className="text-gray-600 mb-6">
        Mã OTP đã được gửi đến <span className="font-medium">{email}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <input
            {...register('otp')}
            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            placeholder="000000"
            maxLength={6}
          />
          {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <LoadingSpinner size="sm" /> : 'Xác nhận'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Chưa nhận được mã?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {resending ? 'Đang gửi...' : 'Gửi lại'}
        </button>
      </p>
    </div>
  );
}
