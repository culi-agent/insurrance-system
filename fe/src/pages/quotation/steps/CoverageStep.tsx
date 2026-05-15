import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuotationStore } from '@/stores/quotationStore';

interface CoverageFormData {
  coverage_type: 'tnds' | 'comprehensive' | 'both';
  coverage_duration: number;
  additional_coverage: {
    passenger_accident: boolean;
    flood_damage: boolean;
    scratch_damage: boolean;
    theft: boolean;
  };
  no_claims_years: number;
  has_garage: boolean;
  has_dashcam: boolean;
}

const CoverageStep: React.FC = () => {
  const { formData, setFormData, setStep, fetchQuickQuote, quickQuote, isLoadingQuick } =
    useQuotationStore();

  const { register, handleSubmit, watch } = useForm<CoverageFormData>({
    defaultValues: {
      coverage_type: formData.coverage_type || 'both',
      coverage_duration: formData.coverage_duration || 12,
      additional_coverage: {
        passenger_accident: formData.additional_coverage?.passenger_accident || false,
        flood_damage: formData.additional_coverage?.flood_damage || false,
        scratch_damage: formData.additional_coverage?.scratch_damage || false,
        theft: formData.additional_coverage?.theft || false,
      },
      no_claims_years: formData.no_claims_years || 0,
      has_garage: formData.has_garage || false,
      has_dashcam: formData.has_dashcam || false,
    },
  });

  // Watch all fields for real-time price update
  const watchedData = watch();

  // Trigger real-time quote calculation when coverage changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      const merged = { ...formData, ...watchedData };
      // Only fetch if we have minimum required data
      if (merged.vehicle_brand && merged.vehicle_value && merged.license_plate) {
        setFormData(watchedData);
        fetchQuickQuote();
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeout);
  }, [
    watchedData.coverage_type,
    watchedData.coverage_duration,
    watchedData.additional_coverage?.passenger_accident,
    watchedData.additional_coverage?.flood_damage,
    watchedData.additional_coverage?.scratch_damage,
    watchedData.additional_coverage?.theft,
    watchedData.no_claims_years,
    watchedData.has_garage,
    watchedData.has_dashcam,
  ]);

  const onSubmit = (data: CoverageFormData) => {
    setFormData(data);
    setStep('owner');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Coverage Options */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Chọn quyền lợi bảo hiểm
          </h2>

          {/* Coverage Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại bảo hiểm <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {[
                {
                  value: 'tnds',
                  label: 'TNDS bắt buộc',
                  desc: 'Trách nhiệm dân sự - Bắt buộc theo luật',
                  price: 'Từ 480.000đ/năm',
                },
                {
                  value: 'comprehensive',
                  label: 'Vật chất xe (tự nguyện)',
                  desc: 'Bồi thường thiệt hại vật chất cho xe',
                  price: 'Từ 1.5% giá trị xe',
                },
                {
                  value: 'both',
                  label: 'Toàn diện (TNDS + Vật chất)',
                  desc: 'Bảo vệ đầy đủ nhất - Khuyên dùng',
                  price: 'Tiết kiệm 5%',
                  recommended: true,
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedData.coverage_type === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('coverage_type')}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {option.recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Khuyến nghị
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">{option.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thời hạn bảo hiểm
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 12, label: '1 năm' },
                { value: 24, label: '2 năm', tag: '-5%' },
                { value: 36, label: '3 năm', tag: '-10%' },
              ].map((d) => (
                <label
                  key={d.value}
                  className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer ${
                    Number(watchedData.coverage_duration) === d.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    value={d.value}
                    {...register('coverage_duration', { valueAsNumber: true })}
                    className="sr-only"
                  />
                  <span className="font-medium">{d.label}</span>
                  {d.tag && (
                    <span className="text-xs text-green-600 font-medium">{d.tag}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Additional Coverage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bảo hiểm bổ sung
            </label>
            <div className="space-y-2">
              {[
                {
                  key: 'passenger_accident' as const,
                  label: 'Tai nạn người ngồi trên xe',
                  desc: '10 triệu/người/vụ',
                },
                {
                  key: 'flood_damage' as const,
                  label: 'Ngập nước',
                  desc: '0.1% giá trị xe',
                },
                {
                  key: 'scratch_damage' as const,
                  label: 'Trầy xước, bể kính',
                  desc: '0.2% giá trị xe',
                },
                {
                  key: 'theft' as const,
                  label: 'Trộm cắp toàn bộ',
                  desc: '0.3% giá trị xe',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`additional_coverage.${item.key}`)}
                      className="w-4 h-4 text-blue-600 rounded mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Discount Factors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yếu tố giảm giá
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Số năm không khiếu nại</label>
                <select
                  {...register('no_claims_years', { valueAsNumber: true })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={0}>Không có</option>
                  <option value={1}>1 năm (-5%)</option>
                  <option value={2}>2 năm (-10%)</option>
                  <option value={3}>3 năm (-15%)</option>
                  <option value={5}>5+ năm (-20%)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('has_garage')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Có garage (-3%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('has_dashcam')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Có dashcam (-2%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Price Preview */}
        <div className="md:w-80">
          <div className="sticky top-24 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ước tính phí bảo hiểm
            </h3>

            {isLoadingQuick ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : quickQuote ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí cơ bản:</span>
                  <span className="font-medium">{formatCurrency(quickQuote.premium.base)}đ</span>
                </div>
                {quickQuote.premium.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-green-600 font-medium">
                      -{formatCurrency(quickQuote.premium.discount)}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT:</span>
                  <span className="font-medium">{formatCurrency(quickQuote.premium.tax)}đ</span>
                </div>
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(quickQuote.premium.total)}đ
                    </span>
                  </div>
                </div>

                {/* Coverage Details */}
                {quickQuote.coverage_details.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Chi tiết quyền lợi:</p>
                    {quickQuote.coverage_details.map((detail, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{detail.name}</span>
                        <span>{formatCurrency(detail.coverage_amount)}đ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Chọn quyền lợi để xem ước tính giá
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={() => setStep('vehicle')}
          className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Quay lại
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tiếp tục - Thông tin chủ xe →
        </button>
      </div>
    </form>
  );
};

export default CoverageStep;
