import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuotationStore } from '@/stores/quotationStore';

interface OwnerFormData {
  owner_name: string;
  owner_id_number: string;
  owner_phone: string;
}

const OwnerInfoStep: React.FC = () => {
  const { formData, setFormData, setStep, fetchComparisonQuotes, isLoadingComparison, error } =
    useQuotationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerFormData>({
    defaultValues: {
      owner_name: formData.owner_name || '',
      owner_id_number: formData.owner_id_number || '',
      owner_phone: formData.owner_phone || '',
    },
  });

  const onSubmit = async (data: OwnerFormData) => {
    setFormData(data);
    await fetchComparisonQuotes();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Thông tin chủ xe
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Thông tin này được sử dụng để tạo báo giá chính xác. Bạn có thể bổ sung sau khi mua.
      </p>

      {/* Owner Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên chủ xe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="VD: Nguyễn Văn A"
          {...register('owner_name', {
            required: 'Vui lòng nhập tên chủ xe',
            minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.owner_name && (
          <p className="text-red-500 text-xs mt-1">{errors.owner_name.message}</p>
        )}
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số CMND/CCCD
        </label>
        <input
          type="text"
          placeholder="VD: 012345678901"
          {...register('owner_id_number')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Không bắt buộc ở bước này</p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại
        </label>
        <input
          type="tel"
          placeholder="VD: 0901234567"
          {...register('owner_phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Tóm tắt</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Xe:</span>{' '}
            <span className="font-medium">
              {formData.vehicle_brand} {formData.vehicle_model} ({formData.vehicle_year})
            </span>
          </div>
          <div>
            <span className="text-gray-500">Biển số:</span>{' '}
            <span className="font-medium">{formData.license_plate}</span>
          </div>
          <div>
            <span className="text-gray-500">Loại BH:</span>{' '}
            <span className="font-medium">
              {formData.coverage_type === 'both'
                ? 'Toàn diện'
                : formData.coverage_type === 'tnds'
                ? 'TNDS'
                : 'Vật chất'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Thời hạn:</span>{' '}
            <span className="font-medium">{formData.coverage_duration} tháng</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={() => setStep('coverage')}
          className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Quay lại
        </button>
        <button
          type="submit"
          disabled={isLoadingComparison}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoadingComparison ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Đang lấy báo giá...
            </>
          ) : (
            'So sánh báo giá →'
          )}
        </button>
      </div>
    </form>
  );
};

export default OwnerInfoStep;
