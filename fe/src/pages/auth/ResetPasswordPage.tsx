import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().length(6, 'Mã OTP phải có 6 ký tự'),
  new_password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
});

type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailFromState = (location.state as any)?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromState },
  });

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.resetPassword({
        email: data.email,
        otp: data.otp,
        new_password: data.new_password,
      });
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công' } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-gray-600">Nhập mã OTP và mật khẩu mới.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã OTP</label>
          <input {...register('otp')} className="input-field text-center text-lg tracking-widest" placeholder="------" maxLength={6} />
          {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
          <input {...register('new_password')} type="password" className="input-field" placeholder="Tối thiểu 8 ký tự" />
          {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
          <input {...register('confirm_password')} type="password" className="input-field" placeholder="Nhập lại mật khẩu mới" />
          {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <LoadingSpinner size="sm" /> : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <Link to="/login" className="block mt-6 text-center text-primary-600 hover:text-primary-700 font-medium">
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
