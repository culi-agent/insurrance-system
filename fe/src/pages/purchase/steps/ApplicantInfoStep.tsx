import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { purchaseService } from '@/services/purchaseService';

const applicantSchema = z.object({
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(200),
  id_number: z.string().regex(/^\d{9,12}$/, 'Số CCCD/CMND phải là 9-12 chữ số'),
  date_of_birth: z.string().min(1, 'Vui lòng nhập ngày sinh'),
  gender: z.enum(['Nam', 'Nữ', 'Khác'], { required_error: 'Vui lòng chọn giới tính' }),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ tối thiểu 5 ký tự').max(500),
  occupation: z.string().optional(),
});

type ApplicantFormData = z.infer<typeof applicantSchema>;

interface Props {
  quotationId: string | null;
}

const ApplicantInfoStep: React.FC<Props> = ({ quotationId }) => {
  const { applicantInfo, setApplicantInfo, nextStep, setCurrentOrder, setLoading, setError } = usePurchaseStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: applicantInfo as ApplicantFormData,
  });

  const onSubmit = async (data: ApplicantFormData) => {
    try {
      setLoading(true);
      setError(null);
      setApplicantInfo(data);

      if (quotationId) {
        const order = await purchaseService.createOrder({
          quotation_id: quotationId,
          applicant_info: data,
        });
        setCurrentOrder(order);
      }

      nextStep();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Thông Tin Người Mua Bảo Hiểm
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              {...register('full_name')}
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nguyễn Văn A"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số CCCD/CMND <span className="text-red-500">*</span>
            </label>
            <input
              {...register('id_number')}
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="079123456789"
            />
            {errors.id_number && (
              <p className="text-red-500 text-sm mt-1">{errors.id_number.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              {...register('date_of_birth')}
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0901234567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              {...register('address')}
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nghề nghiệp
            </label>
            <input
              {...register('occupation')}
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhân viên văn phòng"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicantInfoStep;
