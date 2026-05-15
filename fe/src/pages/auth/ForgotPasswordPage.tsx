import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const schema = z.object({
  email_or_phone: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra email/SMS</h2>
        <p className="text-gray-600 mb-6">
          Nếu tài khoản tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.
        </p>
        <button
          onClick={() => navigate('/reset-password', { state: { email: getValues('email_or_phone') } })}
          className="btn-primary w-full"
        >
          Nhập mã OTP
        </button>
        <Link to="/login" className="block mt-4 text-primary-600 hover:text-primary-700 font-medium">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-gray-600">
          Nhập email hoặc số điện thoại để nhận mã OTP đặt lại mật khẩu.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email hoặc Số điện thoại
          </label>
          <input
            {...register('email_or_phone')}
            className="input-field"
            placeholder="email@example.com hoặc 0912345678"
          />
          {errors.email_or_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.email_or_phone.message}</p>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <LoadingSpinner size="sm" /> : 'Gửi mã OTP'}
        </button>
      </form>

      <Link to="/login" className="block mt-6 text-center text-primary-600 hover:text-primary-700 font-medium">
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
