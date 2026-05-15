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
      login(response.user, response.access_token, response.refresh_token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setError(`Đăng nhập bằng ${provider} đang được phát triển`);
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

      {/* Social login divider */}
      <div className="mt-6">
        <div className="relative" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Hoặc đăng nhập bằng</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Đăng nhập qua mạng xã hội">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Đăng nhập bằng Google"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('facebook')}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Đăng nhập bằng Facebook"
          >
            <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
