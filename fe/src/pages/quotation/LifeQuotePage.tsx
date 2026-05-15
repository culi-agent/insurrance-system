import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

type Step = 'personal' | 'health' | 'coverage' | 'riders' | 'result';

interface RiderOption {
  code: string;
  name: string;
  max_sum_assured_ratio: number;
  description: string;
}

const LifeQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('personal');
  const [loading, setLoading] = useState(false);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Personal
    date_of_birth: '',
    gender: 'male' as 'male' | 'female',
    smoking_status: 'non_smoker' as 'non_smoker' | 'smoker' | 'ex_smoker',
    occupation: '',
    occupation_class: 1,
    annual_income: 0,

    // Health
    height_cm: 170,
    weight_kg: 65,
    health_conditions: [] as string[],
    family_medical_history: [] as string[],

    // Coverage
    sum_assured: 1000000000, // 1 billion VND default
    policy_term: 20,
    premium_payment_term: 15,
    payment_frequency: 'annual' as 'monthly' | 'quarterly' | 'semi_annual' | 'annual',

    // Riders
    selected_riders: [] as Array<{ code: string; sum_assured?: number }>,
  });

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      const res = await api.get('/quotations/life/riders');
      setRiders(res.data.data.riders);
    } catch (error) {
      console.error('Failed to load riders:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/quotations/life/quick', {
        ...formData,
        riders: formData.selected_riders,
      });
      setResult(res.data.data);
      setStep('result');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra khi tính phí');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRider = (code: string) => {
    setFormData(prev => {
      const exists = prev.selected_riders.find(r => r.code === code);
      if (exists) {
        return { ...prev, selected_riders: prev.selected_riders.filter(r => r.code !== code) };
      }
      return { ...prev, selected_riders: [...prev.selected_riders, { code }] };
    });
  };

  const toggleCondition = (condition: string, field: 'health_conditions' | 'family_medical_history') => {
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(condition)) {
        return { ...prev, [field]: list.filter(c => c !== condition) };
      }
      return { ...prev, [field]: [...list, condition] };
    });
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'personal', label: 'Thông tin cá nhân' },
    { key: 'health', label: 'Sức khỏe' },
    { key: 'coverage', label: 'Quyền lợi' },
    { key: 'riders', label: 'Sản phẩm bổ trợ' },
    { key: 'result', label: 'Kết quả' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo Giá Bảo Hiểm Nhân Thọ</h1>
      <p className="text-gray-600 mb-6">Nhận báo giá ngay trong vài phút</p>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className={`flex items-center ${idx <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx < currentStepIndex ? 'bg-blue-600 text-white' :
                idx === currentStepIndex ? 'border-2 border-blue-600 text-blue-600' :
                'border-2 border-gray-300 text-gray-400'
              }`}>
                {idx < currentStepIndex ? '✓' : idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:inline">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${idx < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 'personal' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông Tin Cá Nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày sinh *</label>
              <input type="date" value={formData.date_of_birth}
                onChange={e => updateField('date_of_birth', e.target.value)}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giới tính *</label>
              <select value={formData.gender} onChange={e => updateField('gender', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tình trạng hút thuốc *</label>
              <select value={formData.smoking_status} onChange={e => updateField('smoking_status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="non_smoker">Không hút thuốc</option>
                <option value="ex_smoker">Đã bỏ thuốc</option>
                <option value="smoker">Đang hút thuốc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nghề nghiệp *</label>
              <input type="text" value={formData.occupation}
                onChange={e => updateField('occupation', e.target.value)}
                placeholder="VD: Nhân viên văn phòng"
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nhóm nghề nghiệp</label>
              <select value={formData.occupation_class} onChange={e => updateField('occupation_class', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={1}>Nhóm 1 - Văn phòng, ít rủi ro</option>
                <option value={2}>Nhóm 2 - Lao động nhẹ</option>
                <option value={3}>Nhóm 3 - Lao động nặng</option>
                <option value={4}>Nhóm 4 - Nguy hiểm cao</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thu nhập hàng năm (VND)</label>
              <input type="number" value={formData.annual_income}
                onChange={e => updateField('annual_income', parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setStep('health')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Health */}
      {step === 'health' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông Tin Sức Khỏe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chiều cao (cm)</label>
              <input type="number" value={formData.height_cm}
                onChange={e => updateField('height_cm', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
              <input type="number" value={formData.weight_kg}
                onChange={e => updateField('weight_kg', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">
              BMI: {(formData.weight_kg / Math.pow(formData.height_cm / 100, 2)).toFixed(1)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bệnh lý hiện có (nếu có)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['hypertension', 'diabetes_type2', 'asthma', 'thyroid_disorder', 'heart_disease', 'back_pain', 'anxiety', 'depression'].map(c => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.health_conditions.includes(c)}
                    onChange={() => toggleCondition(c, 'health_conditions')}
                    className="rounded border-gray-300" />
                  {getConditionLabel(c)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tiền sử bệnh gia đình</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['cancer', 'heart_disease', 'stroke', 'diabetes'].map(c => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.family_medical_history.includes(c)}
                    onChange={() => toggleCondition(c, 'family_medical_history')}
                    className="rounded border-gray-300" />
                  {getConditionLabel(c)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('personal')} className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
              Quay lại
            </button>
            <button onClick={() => setStep('coverage')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Coverage */}
      {step === 'coverage' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Quyền Lợi Bảo Hiểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Số tiền bảo hiểm (VND) *</label>
              <select value={formData.sum_assured} onChange={e => updateField('sum_assured', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={500000000}>500 triệu</option>
                <option value={1000000000}>1 tỷ</option>
                <option value={2000000000}>2 tỷ</option>
                <option value={3000000000}>3 tỷ</option>
                <option value={5000000000}>5 tỷ</option>
                <option value={10000000000}>10 tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời hạn hợp đồng *</label>
              <select value={formData.policy_term} onChange={e => updateField('policy_term', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={10}>10 năm</option>
                <option value={15}>15 năm</option>
                <option value={20}>20 năm</option>
                <option value={25}>25 năm</option>
                <option value={30}>30 năm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời hạn đóng phí *</label>
              <select value={formData.premium_payment_term}
                onChange={e => updateField('premium_payment_term', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={5}>5 năm</option>
                <option value={10}>10 năm</option>
                <option value={15}>15 năm</option>
                <option value={20}>20 năm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tần suất đóng phí</label>
              <select value={formData.payment_frequency}
                onChange={e => updateField('payment_frequency', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="annual">Hàng năm</option>
                <option value="semi_annual">6 tháng/lần (+2%)</option>
                <option value="quarterly">Hàng quý (+3%)</option>
                <option value="monthly">Hàng tháng (+5%)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('health')} className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
              Quay lại
            </button>
            <button onClick={() => setStep('riders')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Riders */}
      {step === 'riders' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sản Phẩm Bổ Trợ (Riders)</h2>
          <p className="text-sm text-gray-600">Chọn các quyền lợi bổ sung cho hợp đồng bảo hiểm</p>

          <div className="space-y-3">
            {riders.map(rider => (
              <label key={rider.code}
                className={`block border rounded-lg p-4 cursor-pointer transition ${
                  formData.selected_riders.some(r => r.code === rider.code)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.selected_riders.some(r => r.code === rider.code)}
                    onChange={() => toggleRider(rider.code)}
                    className="mt-1 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{rider.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{rider.description}</p>
                    {rider.max_sum_assured_ratio > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        STBH tối đa: {rider.max_sum_assured_ratio * 100}% STBH chính
                      </p>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('coverage')} className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
              Quay lại
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Đang tính phí...' : 'Xem kết quả'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Result */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Kết Quả Báo Giá</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-blue-600">Phí bảo hiểm {formData.payment_frequency === 'annual' ? 'hàng năm' : ''}</p>
                <p className="text-3xl font-bold text-blue-800">
                  {result.premium_per_payment.toLocaleString('vi-VN')} VND
                </p>
                <p className="text-sm text-blue-600">
                  /{formData.payment_frequency === 'monthly' ? 'tháng' : formData.payment_frequency === 'quarterly' ? 'quý' : formData.payment_frequency === 'semi_annual' ? '6 tháng' : 'năm'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">STBH</p>
                <p className="font-medium">{result.sum_assured.toLocaleString('vi-VN')} VND</p>
              </div>
              <div>
                <p className="text-gray-500">Phí BH cơ bản/năm</p>
                <p className="font-medium">{result.base_premium.toLocaleString('vi-VN')} VND</p>
              </div>
              <div>
                <p className="text-gray-500">Thời hạn HĐ</p>
                <p className="font-medium">{result.policy_term} năm</p>
              </div>
              <div>
                <p className="text-gray-500">Đóng phí trong</p>
                <p className="font-medium">{result.premium_payment_term} năm</p>
              </div>
              <div>
                <p className="text-gray-500">Nhóm rủi ro</p>
                <p className="font-medium capitalize">{result.risk_class}</p>
              </div>
              <div>
                <p className="text-gray-500">Tổng phí/năm</p>
                <p className="font-medium">{result.total_premium.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>

            {/* Rider premiums */}
            {result.rider_premiums.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Phí sản phẩm bổ trợ</h3>
                {result.rider_premiums.map((r: any) => (
                  <div key={r.code} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{r.name}</span>
                    <span className="font-medium">{r.premium.toLocaleString('vi-VN')} VND/năm</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Illustration summary */}
          {result.illustration?.summary && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Minh Họa Quyền Lợi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500">Tổng phí đóng</p>
                  <p className="text-lg font-bold">{result.illustration.summary.total_premium_paid.toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500">Quyền lợi tử vong</p>
                  <p className="text-lg font-bold">{result.illustration.summary.death_benefit.toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-gray-500">Giá trị đáo hạn (TB)</p>
                  <p className="text-lg font-bold text-green-700">{result.illustration.summary.maturity_benefit_mid.toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-gray-500">Giá trị đáo hạn (Cao)</p>
                  <p className="text-lg font-bold text-blue-700">{result.illustration.summary.maturity_benefit_high.toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('riders')} className="flex-1 px-6 py-3 border text-gray-700 rounded-lg hover:bg-gray-50">
              Điều chỉnh
            </button>
            <button onClick={() => navigate('/purchase')} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Mua ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    hypertension: 'Cao huyết áp',
    diabetes_type2: 'Tiểu đường type 2',
    asthma: 'Hen suyễn',
    thyroid_disorder: 'Rối loạn tuyến giáp',
    heart_disease: 'Bệnh tim',
    back_pain: 'Đau lưng',
    anxiety: 'Lo âu',
    depression: 'Trầm cảm',
    cancer: 'Ung thư',
    stroke: 'Đột quỵ',
    diabetes: 'Tiểu đường',
  };
  return labels[condition] || condition;
}

export default LifeQuotePage;
