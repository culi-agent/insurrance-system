import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LiveRegion } from '@/components/common/accessibility';

/**
 * Login Page - WCAG 2.1 accessible
 * - Proper form labels linked to inputs (1.3.1)
 * - Error messages with role="alert" (4.1.3)
 * - Focus management on error (2.4.3)
 * - Keyboard accessible (2.1.1)
 * - Sufficient color contrast (1.4.3)
 * - Input purpose identification via autocomplete (1.3.5)
 */

const loginSchema = z.object({
  email_or_phone: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  remember_me: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  });

  // Focus error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(data);
      login(response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="mt-2 text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      {/* Live region for screen reader announcements */}
      <LiveRegion message={isLoading ? 'Đang đăng nhập...' : ''} type="polite" />

      {/* Error alert - WCAG 4.1.3 */}
      {error && (
        <div
          ref={errorRef}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
        >
          <span className="font-medium">Lỗi:</span> {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
        aria-label="Đăng nhập"
      >
        {/* Email/Phone field */}
        <div>
          <label
            htmlFor="email_or_phone"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email hoặc Số điện thoại
            <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          </label>
          <input
            {...register('email_or_phone')}
            id="email_or_phone"
            type="text"
            autoComplete="username"
            className={`input-field ${errors.email_or_phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="email@example.com hoặc +84912345678"
            aria-invalid={errors.email_or_phone ? 'true' : 'false'}
            aria-describedby={errors.email_or_phone ? 'email-error' : undefined}
            aria-required="true"
          />
          {errors.email_or_phone && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email_or_phone.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
              <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="Nhập mật khẩu"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-required="true"
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center">
          <input
            {...register('remember_me')}
            id="remember_me"
            type="checkbox"
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="remember_me" className="ml-2 text-sm text-gray-600">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
          aria-busy={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" label="Đang xử lý đăng nhập..." /> : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
