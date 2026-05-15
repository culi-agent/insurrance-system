import React from 'react';
import type { HealthFormData } from '../HealthQuotePage';

interface Props {
  formData: Partial<HealthFormData>;
  updateFormData: (data: Partial<HealthFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PLANS = [
  { id: 'basic', name: 'Cơ bản', limit: '500 triệu/năm', price: 'Từ 2.5tr', features: ['Nội trú', 'Phẫu thuật', 'ICU'] },
  { id: 'standard', name: 'Tiêu chuẩn', limit: '1.5 tỷ/năm', price: 'Từ 7tr', features: ['Nội trú + Ngoại trú', 'Phẫu thuật', 'ICU', 'Xe cấp cứu'], recommended: true },
  { id: 'premium', name: 'Cao cấp', limit: '5 tỷ/năm', price: 'Từ 14tr', features: ['Toàn diện', 'Phòng VIP', 'Nha khoa', 'Mạng lưới quốc tế'] },
  { id: 'platinum', name: 'Bạch kim', limit: '10 tỷ/năm', price: 'Từ 28tr', features: ['Không giới hạn', 'Toàn cầu', 'Concierge', 'Second opinion'] },
];

const HealthCoverageStep: React.FC<Props> = ({ formData, updateFormData, onNext, onPrev }) => {
  const coverage = formData.coverage_options || {
    annual_limit: 1500000000, deductible: 0, room_type: 'standard',
    include_dental: false, include_maternity: false, include_outpatient: true,
    include_wellness: false, geographic_coverage: 'vietnam',
  };

  const updateCoverage = (field: string, value: any) => {
    updateFormData({ coverage_options: { ...coverage, [field]: value } } as any);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn Gói Bảo Hiểm</h2>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PLANS.map((plan) => (
          <div key={plan.id} onClick={() => updateFormData({ plan_type: plan.id })}
            className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all ${
              formData.plan_type === plan.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}>
            {plan.recommended && <span className="absolute -top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Phổ biến</span>}
            <h3 className="font-bold text-gray-900">{plan.name}</h3>
            <p className="text-blue-600 font-semibold text-sm mt-1">{plan.limit}</p>
            <p className="text-xs text-gray-500 mt-0.5">{plan.price}/người/năm</p>
            <ul className="mt-2 space-y-1">
              {plan.features.map((f, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Coverage Options */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900">Tùy chọn quyền lợi bổ sung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${coverage.include_outpatient ? 'border-blue-300 bg-blue-50' : ''}`}>
            <input type="checkbox" checked={coverage.include_outpatient} onChange={(e) => updateCoverage('include_outpatient', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <div><span className="text-sm font-medium">Ngoại trú</span><p className="text-xs text-gray-500">Khám bệnh, xét nghiệm</p></div>
          </label>
          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${coverage.include_dental ? 'border-blue-300 bg-blue-50' : ''}`}>
            <input type="checkbox" checked={coverage.include_dental} onChange={(e) => updateCoverage('include_dental', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <div><span className="text-sm font-medium">Nha khoa</span><p className="text-xs text-gray-500">Khám, trám, nhổ răng</p></div>
          </label>
          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${coverage.include_maternity ? 'border-blue-300 bg-blue-50' : ''}`}>
            <input type="checkbox" checked={coverage.include_maternity} onChange={(e) => updateCoverage('include_maternity', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <div><span className="text-sm font-medium">Thai sản</span><p className="text-xs text-gray-500">Sinh đẻ, chăm sóc trước/sau sinh</p></div>
          </label>
          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${coverage.include_wellness ? 'border-blue-300 bg-blue-50' : ''}`}>
            <input type="checkbox" checked={coverage.include_wellness} onChange={(e) => updateCoverage('include_wellness', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <div><span className="text-sm font-medium">Chăm sóc sức khỏe</span><p className="text-xs text-gray-500">Khám tổng quát định kỳ</p></div>
          </label>
        </div>
      </div>

      {/* Room & Geographic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng nằm viện</label>
          <select value={coverage.room_type} onChange={(e) => updateCoverage('room_type', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="standard">Phòng thường</option>
            <option value="deluxe">Phòng Deluxe</option>
            <option value="vip">Phòng VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phạm vi địa lý</label>
          <select value={coverage.geographic_coverage} onChange={(e) => updateCoverage('geographic_coverage', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="vietnam">Việt Nam</option>
            <option value="asia">Châu Á</option>
            <option value="worldwide">Toàn cầu</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại</button>
        <button onClick={onNext} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Xem báo giá</button>
      </div>
    </div>
  );
};

export default HealthCoverageStep;
