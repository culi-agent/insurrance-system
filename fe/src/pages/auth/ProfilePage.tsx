import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  id_number: z.string().optional(),
  id_number_type: z.string().optional(),
  language: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  new_password: z.string().min(8, 'Tối thiểu 8 ký tự'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirm_password'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile: updateStore } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || '',
      language: 'vi',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await authService.updateProfile(data);
      updateStore(updated);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Cập nhật thất bại' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' });
      passwordForm.reset();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h1>

      {/* User info card */}
      <div className="card mb-6 flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-600 font-bold text-xl">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user?.full_name}</h2>
          <p className="text-gray-600">{user?.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
              user?.email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user?.email_verified ? 'Email xác thực' : 'Email chưa xác thực'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
              user?.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              KYC: {user?.kyc_status || 'pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => { setTab('profile'); setMessage({ type: '', text: '' }); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => { setTab('password'); setMessage({ type: '', text: '' }); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'password' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <input {...profileForm.register('full_name')} className="input-field" />
              {profileForm.formState.errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sinh</label>
              <input {...profileForm.register('date_of_birth')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới tính</label>
              <select {...profileForm.register('gender')} className="input-field">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CCCD/CMND</label>
              <input {...profileForm.register('id_number')} className="input-field" placeholder="Số CCCD" />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="card space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
            <input {...passwordForm.register('current_password')} type="password" className="input-field" />
            {passwordForm.formState.errors.current_password && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
            <input {...passwordForm.register('new_password')} type="password" className="input-field" />
            {passwordForm.formState.errors.new_password && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
            <input {...passwordForm.register('confirm_password')} type="password" className="input-field" />
            {passwordForm.formState.errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirm_password.message}</p>
            )}
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
