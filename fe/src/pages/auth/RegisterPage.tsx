import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { passwordSchema, PASSWORD_RULES } from '@/lib/validation/password-rules';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  password: passwordSchema,
  confirm_password: z.string(),
  agree_terms: z.literal(true, { errorMap: () => ({ message: 'Bạn cần đồng ý điều khoản' }) }),
}).refine((data) => data.password === data.confirm_password, {
  message: PASSWORD_RULES.messages.confirmMismatch,
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
    </div>
  );
}
