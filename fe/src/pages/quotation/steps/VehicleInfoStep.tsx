import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuotationStore } from '@/stores/quotationStore';
import { VEHICLE_BRANDS } from '@/types/quotation';

interface VehicleFormData {
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'bus';
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  license_plate: string;
  engine_capacity: number;
  vehicle_value: number;
  seats: number;
  usage: 'personal' | 'commercial' | 'taxi';
}

const VehicleInfoStep: React.FC = () => {
  const { formData, setFormData, setStep } = useQuotationStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VehicleFormData>({
    defaultValues: {
      vehicle_type: formData.vehicle_type || 'car',
      vehicle_brand: formData.vehicle_brand || '',
      vehicle_model: formData.vehicle_model || '',
      vehicle_year: formData.vehicle_year || new Date().getFullYear(),
      license_plate: formData.license_plate || '',
      engine_capacity: formData.engine_capacity || 1500,
      vehicle_value: formData.vehicle_value || 500000000,
      seats: formData.seats || 5,
      usage: formData.usage || 'personal',
    },
  });

  const vehicleType = watch('vehicle_type');
  const selectedBrand = watch('vehicle_brand');

  const brands = useMemo(() => VEHICLE_BRANDS[vehicleType] || [], [vehicleType]);
  const models = useMemo(() => {
    const brand = brands.find((b) => b.name === selectedBrand);
    return brand?.models || [];
  }, [brands, selectedBrand]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const onSubmit = (data: VehicleFormData) => {
    setFormData(data);
    setStep('coverage');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Thông tin xe
      </h2>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại phương tiện <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'car', label: 'Ô tô', icon: '🚗' },
            { value: 'motorcycle', label: 'Xe máy', icon: '🏍️' },
            { value: 'truck', label: 'Xe tải', icon: '🚚' },
            { value: 'bus', label: 'Xe khách', icon: '🚌' },
          ].map((type) => (
            <label
              key={type.value}
              className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                vehicleType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                value={type.value}
                {...register('vehicle_type', { required: true })}
                className="sr-only"
              />
              <span className="text-2xl mb-1">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hãng xe <span className="text-red-500">*</span>
          </label>
          <select
            {...register('vehicle_brand', { required: 'Vui lòng chọn hãng xe' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn hãng xe --</option>
            {brands.map((brand) => (
              <option key={brand.name} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.vehicle_brand && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicle_brand.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dòng xe <span className="text-red-500">*</span>
          </label>
          <select
            {...register('vehicle_model', { required: 'Vui lòng chọn dòng xe' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn dòng xe --</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.vehicle_model && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicle_model.message}</p>
          )}
        </div>
      </div>

      {/* Year & License Plate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm sản xuất <span className="text-red-500">*</span>
          </label>
          <select
            {...register('vehicle_year', { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biển số xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: 30A-12345"
            {...register('license_plate', {
              required: 'Vui lòng nhập biển số xe',
              minLength: { value: 5, message: 'Biển số xe tối thiểu 5 ký tự' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.license_plate && (
            <p className="text-red-500 text-xs mt-1">{errors.license_plate.message}</p>
          )}
        </div>
      </div>

      {/* Engine Capacity & Vehicle Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dung tích động cơ (cc) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="VD: 1500"
            {...register('engine_capacity', {
              required: 'Vui lòng nhập dung tích',
              valueAsNumber: true,
              min: { value: 50, message: 'Tối thiểu 50cc' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.engine_capacity && (
            <p className="text-red-500 text-xs mt-1">{errors.engine_capacity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá trị xe (VND) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="VD: 500000000"
            {...register('vehicle_value', {
              required: 'Vui lòng nhập giá trị xe',
              valueAsNumber: true,
              min: { value: 5000000, message: 'Tối thiểu 5.000.000 VND' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.vehicle_value && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicle_value.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {watch('vehicle_value') ? formatCurrency(watch('vehicle_value')) + ' VND' : ''}
          </p>
        </div>
      </div>

      {/* Seats & Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số chỗ ngồi <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('seats', {
              required: true,
              valueAsNumber: true,
              min: { value: 1, message: 'Tối thiểu 1' },
              max: { value: 60, message: 'Tối đa 60' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mục đích sử dụng <span className="text-red-500">*</span>
          </label>
          <select
            {...register('usage', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="personal">Cá nhân</option>
            <option value="commercial">Kinh doanh</option>
            <option value="taxi">Taxi / Grab</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tiếp tục - Chọn quyền lợi →
        </button>
      </div>
    </form>
  );
};

export default VehicleInfoStep;
