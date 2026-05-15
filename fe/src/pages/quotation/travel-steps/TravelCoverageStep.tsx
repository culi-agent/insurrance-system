import React from 'react';
import type { TravelFormData } from '../TravelQuotePage';

interface Props {
  formData: Partial<TravelFormData>;
  updateFormData: (data: Partial<TravelFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PLANS = [
  {
    id: 'basic',
    name: 'Cơ bản',
    description: 'Bảo vệ thiết yếu cho chuyến đi ngắn ngày',
    price_label: 'Từ 15.000đ/ngày',
    features: ['Chi phí y tế 500 triệu', 'Tai nạn cá nhân 200 triệu', 'Hành lý 15 triệu'],
    color: 'gray',
  },
  {
    id: 'standard',
    name: 'Tiêu chuẩn',
    description: 'Phù hợp đa số chuyến đi',
    price_label: 'Từ 30.000đ/ngày',
    features: ['Chi phí y tế 1.5 tỷ', 'Tai nạn cá nhân 500 triệu', 'Hành lý 30 triệu', 'Hủy chuyến 50 triệu'],
    color: 'blue',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    description: 'Bảo vệ toàn diện nhất',
    price_label: 'Từ 55.000đ/ngày',
    features: ['Chi phí y tế 5 tỷ', 'Tai nạn cá nhân 1 tỷ', 'Hành lý 50 triệu', 'Hủy chuyến 100 triệu', 'Di tản 5 tỷ'],
    color: 'purple',
  },
];

const COVERAGE_OPTIONS = [
  { key: 'medical_expense', label: 'Chi phí y tế & điều trị', default: true },
  { key: 'trip_cancellation', label: 'Hủy chuyến đi', default: false },
  { key: 'trip_delay', label: 'Trễ chuyến', default: true },
  { key: 'baggage_loss', label: 'Mất/hư hỏng hành lý', default: true },
  { key: 'personal_accident', label: 'Tai nạn cá nhân', default: true },
  { key: 'personal_liability', label: 'Trách nhiệm dân sự', default: true },
  { key: 'emergency_evacuation', label: 'Di tản y tế khẩn cấp', default: true },
  { key: 'flight_delay_compensation', label: 'Bồi thường trễ chuyến bay', default: false },
];

const TravelCoverageStep: React.FC<Props> = ({ formData, updateFormData, onNext, onPrev }) => {
  const coverageOptions = formData.coverage_options || {};

  const toggleCoverage = (key: string) => {
    updateFormData({
      coverage_options: {
        ...coverageOptions,
        [key]: !(coverageOptions as any)[key],
      } as any,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn Gói Bảo Hiểm</h2>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => updateFormData({ plan_type: plan.id })}
            className={`relative cursor-pointer border-2 rounded-xl p-5 transition-all ${
              formData.plan_type === plan.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                Phổ biến nhất
              </span>
            )}
            <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            <p className="text-blue-600 font-semibold mt-2">{plan.price_label}</p>
            <ul className="mt-3 space-y-1.5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Additional Coverage Options */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Tùy chọn quyền lợi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COVERAGE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                (coverageOptions as any)[opt.key] ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={(coverageOptions as any)[opt.key] || false}
                onChange={() => toggleCoverage(opt.key)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Quay lại
        </button>
        <button onClick={onNext} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
          Xem báo giá
        </button>
      </div>
    </div>
  );
};

export default TravelCoverageStep;
