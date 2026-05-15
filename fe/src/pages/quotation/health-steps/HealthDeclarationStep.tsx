import React from 'react';
import type { HealthFormData } from '../HealthQuotePage';

interface Props {
  formData: Partial<HealthFormData>;
  updateFormData: (data: Partial<HealthFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PRE_EXISTING_CONDITIONS = [
  'Tiểu đường', 'Huyết áp cao', 'Tim mạch', 'Hen suyễn', 'Ung thư',
  'Viêm gan B/C', 'Bệnh thận', 'Thoát vị đĩa đệm', 'Trầm cảm', 'Khác',
];

const HealthDeclarationStep: React.FC<Props> = ({ formData, updateFormData, onNext, onPrev }) => {
  const decl = formData.health_declaration || {
    height_cm: 170, weight_kg: 65, is_smoker: false, is_drinker: false,
    has_pre_existing_conditions: false, pre_existing_conditions: [],
    has_hospitalized_last_5years: false, hospitalization_details: '',
    is_on_medication: false, medication_details: '',
    has_family_history: false, family_history_conditions: [],
  };

  const updateDecl = (field: string, value: any) => {
    updateFormData({ health_declaration: { ...decl, [field]: value } } as any);
  };

  const toggleCondition = (condition: string) => {
    const current = decl.pre_existing_conditions || [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    updateDecl('pre_existing_conditions', updated);
  };

  const bmi = decl.height_cm > 0 ? (decl.weight_kg / ((decl.height_cm / 100) ** 2)).toFixed(1) : '0';
  const bmiCategory = parseFloat(bmi) < 18.5 ? 'Thiếu cân' : parseFloat(bmi) < 25 ? 'Bình thường' : parseFloat(bmi) < 30 ? 'Thừa cân' : 'Béo phì';

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Khai Báo Sức Khỏe</h2>
      <p className="text-gray-600 mb-6">Vui lòng khai báo trung thực để nhận quyền lợi đầy đủ</p>

      {/* Body Measurements */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Chỉ số cơ thể</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Chiều cao (cm)</label>
            <input type="number" min={100} max={250} value={decl.height_cm} onChange={(e) => updateDecl('height_cm', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cân nặng (kg)</label>
            <input type="number" min={20} max={300} value={decl.weight_kg} onChange={(e) => updateDecl('weight_kg', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">BMI</label>
            <div className="px-3 py-2 bg-white border rounded-lg">
              <span className="font-semibold">{bmi}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                bmiCategory === 'Bình thường' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>{bmiCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="mb-6 space-y-3">
        <h3 className="font-medium text-gray-900">Lối sống</h3>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={decl.is_smoker} onChange={(e) => updateDecl('is_smoker', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded" />
          <div>
            <span className="font-medium">Hút thuốc lá</span>
            <p className="text-xs text-gray-500">Hiện tại hoặc trong 12 tháng qua</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={decl.is_drinker} onChange={(e) => updateDecl('is_drinker', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded" />
          <div>
            <span className="font-medium">Uống rượu bia thường xuyên</span>
            <p className="text-xs text-gray-500">Trên 3 lần/tuần</p>
          </div>
        </label>
      </div>

      {/* Medical History */}
      <div className="mb-6 space-y-4">
        <h3 className="font-medium text-gray-900">Tiền sử bệnh</h3>

        <div className="p-4 border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={decl.has_pre_existing_conditions}
              onChange={(e) => updateDecl('has_pre_existing_conditions', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="font-medium">Có bệnh lý đã/đang điều trị?</span>
          </label>
          {decl.has_pre_existing_conditions && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {PRE_EXISTING_CONDITIONS.map((cond) => (
                <label key={cond} className={`flex items-center gap-2 p-2 rounded border text-sm cursor-pointer ${
                  decl.pre_existing_conditions?.includes(cond) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                }`}>
                  <input type="checkbox" checked={decl.pre_existing_conditions?.includes(cond) || false}
                    onChange={() => toggleCondition(cond)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  {cond}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={decl.has_hospitalized_last_5years}
              onChange={(e) => updateDecl('has_hospitalized_last_5years', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="font-medium">Đã nằm viện trong 5 năm qua?</span>
          </label>
          {decl.has_hospitalized_last_5years && (
            <textarea value={decl.hospitalization_details} onChange={(e) => updateDecl('hospitalization_details', e.target.value)}
              className="mt-3 w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Mô tả ngắn gọn lý do nằm viện..." />
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={decl.is_on_medication}
              onChange={(e) => updateDecl('is_on_medication', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="font-medium">Đang sử dụng thuốc điều trị?</span>
          </label>
          {decl.is_on_medication && (
            <input type="text" value={decl.medication_details} onChange={(e) => updateDecl('medication_details', e.target.value)}
              className="mt-3 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Tên thuốc đang dùng..." />
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={decl.has_family_history}
              onChange={(e) => updateDecl('has_family_history', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="font-medium">Gia đình có tiền sử bệnh nặng?</span>
            <span className="text-xs text-gray-500">(Ung thư, tim mạch, tiểu đường...)</span>
          </label>
        </div>
      </div>

      {/* Notice */}
      <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800 mb-6">
        <strong>Lưu ý:</strong> Khai báo trung thực giúp bạn được bồi thường đầy đủ khi có sự cố. Khai báo sai có thể dẫn đến từ chối bồi thường.
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại</button>
        <button onClick={onNext} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Tiếp tục</button>
      </div>
    </div>
  );
};

export default HealthDeclarationStep;
