import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/(?=.*[a-z])/, 'Phải có ít nhất 1 chữ thường')
    .regex(/(?=.*[A-Z])/, 'Phải có ít nhất 1 chữ hoa')
    .regex(/(?=.*\d)/, 'Phải có ít nhất 1 số'),
  confirm_password: z.string(),
  agree_terms: z.literal(true, { errorMap: () => ({ message: 'Bạn cần đồng ý điều khoản' }) }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.register({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      navigate('/verify-otp', { state: { email: data.email, type: 'verify' } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h2>
        <p className="mt-2 text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
          <input {...register('full_name')} className="input-field" placeholder="Nguyễn Văn A" />
          {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
          <input {...register('phone')} className="input-field" placeholder="0912345678" />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
          <input {...register('password')} type="password" className="input-field" placeholder="Tối thiểu 8 ký tự" />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
          <input {...register('confirm_password')} type="password" className="input-field" placeholder="Nhập lại mật khẩu" />
          {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>}
        </div>

        <div className="flex items-start">
          <input
            {...register('agree_terms')}
            type="checkbox"
            className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label className="ml-2 text-sm text-gray-600">
            Tôi đồng ý với{' '}
            <a href="#" className="text-primary-600 hover:underline">Điều khoản dịch vụ</a>
            {' '}và{' '}
            <a href="#" className="text-primary-600 hover:underline">Chính sách bảo mật</a>
          </label>
        </div>
        {errors.agree_terms && <p className="text-sm text-red-600">{errors.agree_terms.message}</p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <LoadingSpinner size="sm" /> : 'Đăng ký'}
        </button>
      </form>

      {/* Social login */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Hoặc đăng ký bằng</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
