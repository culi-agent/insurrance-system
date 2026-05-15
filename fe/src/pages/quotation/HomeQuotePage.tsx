import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

type Step = 'property' | 'coverage' | 'security' | 'result';

const HomeQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('property');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [coverageOptions, setCoverageOptions] = useState<any>(null);

  const [formData, setFormData] = useState({
    property_type: 'house' as 'apartment' | 'house' | 'townhouse' | 'villa',
    ownership_status: 'owned' as 'owned' | 'rented' | 'mortgaged',
    construction_type: 'brick' as 'concrete' | 'brick' | 'wood' | 'mixed',
    year_built: 2015,
    total_area_sqm: 100,
    floors: 2,
    address: { province: 'Hà Nội', district: '', ward: '', street_address: '' },
    building_value: 2000000000,
    contents_value: 500000000,
    coverage_type: 'standard' as 'basic' | 'standard' | 'comprehensive',
    additional_coverages: [] as string[],
    security_features: [] as string[],
    duration_months: 12,
  });

  useEffect(() => {
    loadCoverageOptions();
  }, []);

  const loadCoverageOptions = async () => {
    try {
      const res = await api.get('/quotations/home/coverage-options');
      setCoverageOptions(res.data.data);
    } catch (error) {
      console.error('Failed to load coverage options:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/quotations/home/quick', formData);
      setResult(res.data.data);
      setStep('result');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const toggleArrayItem = (field: 'additional_coverages' | 'security_features', item: string) => {
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
      return { ...prev, [field]: [...list, item] };
    });
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'property', label: 'Thông tin nhà' },
    { key: 'coverage', label: 'Quyền lợi' },
    { key: 'security', label: 'An ninh' },
    { key: 'result', label: 'Kết quả' },
  ];
  const currentIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo Giá Bảo Hiểm Nhà Ở</h1>
      <p className="text-gray-600 mb-6">Bảo vệ tổ ấm của bạn trước mọi rủi ro</p>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className={`flex items-center ${idx <= currentIdx ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx < currentIdx ? 'bg-blue-600 text-white' : idx === currentIdx ? 'border-2 border-blue-600' : 'border-2 border-gray-300'
              }`}>{idx < currentIdx ? '✓' : idx + 1}</div>
              <span className="ml-2 text-sm font-medium hidden md:inline">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${idx < currentIdx ? 'bg-blue-600' : 'bg-gray-300'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Property Info */}
      {step === 'property' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông Tin Nhà Ở</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại nhà *</label>
              <select value={formData.property_type} onChange={e => updateField('property_type', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="apartment">Chung cư</option>
                <option value="townhouse">Nhà phố</option>
                <option value="house">Nhà riêng</option>
                <option value="villa">Biệt thự</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tình trạng sở hữu</label>
              <select value={formData.ownership_status} onChange={e => updateField('ownership_status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="owned">Sở hữu</option>
                <option value="rented">Thuê</option>
                <option value="mortgaged">Thế chấp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kết cấu xây dựng *</label>
              <select value={formData.construction_type} onChange={e => updateField('construction_type', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="concrete">Bê tông cốt thép</option>
                <option value="brick">Gạch</option>
                <option value="mixed">Hỗn hợp</option>
                <option value="wood">Gỗ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm xây dựng</label>
              <input type="number" value={formData.year_built}
                onChange={e => updateField('year_built', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2" min={1950} max={2026} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
              <input type="number" value={formData.total_area_sqm}
                onChange={e => updateField('total_area_sqm', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số tầng</label>
              <input type="number" value={formData.floors}
                onChange={e => updateField('floors', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2" min={1} max={50} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố *</label>
              <select value={formData.address.province} onChange={e => updateAddress('province', e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quận/Huyện</label>
              <input value={formData.address.district} onChange={e => updateAddress('district', e.target.value)}
                className="w-full border rounded-lg px-3 py-2" placeholder="Nhập quận/huyện" />
            </div>
          </div>

          <h3 className="font-medium pt-4">Giá trị tài sản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giá trị nhà (VND) *</label>
              <select value={formData.building_value} onChange={e => updateField('building_value', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={500000000}>500 triệu</option>
                <option value={1000000000}>1 tỷ</option>
                <option value={2000000000}>2 tỷ</option>
                <option value={3000000000}>3 tỷ</option>
                <option value={5000000000}>5 tỷ</option>
                <option value={10000000000}>10 tỷ</option>
                <option value={20000000000}>20 tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá trị nội thất (VND)</label>
              <select value={formData.contents_value} onChange={e => updateField('contents_value', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2">
                <option value={100000000}>100 triệu</option>
                <option value={200000000}>200 triệu</option>
                <option value={500000000}>500 triệu</option>
                <option value={1000000000}>1 tỷ</option>
                <option value={2000000000}>2 tỷ</option>
                <option value={5000000000}>5 tỷ</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => setStep('coverage')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tiếp theo</button>
          </div>
        </div>
      )}

      {/* Step 2: Coverage */}
      {step === 'coverage' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Gói Bảo Hiểm & Quyền Lợi Bổ Sung</h2>

          <div>
            <label className="block text-sm font-medium mb-3">Chọn gói bảo hiểm *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'basic', name: 'Cơ bản', desc: 'Hỏa hoạn, thiên tai', price: 'Từ 800K/năm' },
                { value: 'standard', name: 'Tiêu chuẩn', desc: 'Mở rộng + trộm cắp', price: 'Từ 1.5M/năm' },
                { value: 'comprehensive', name: 'Toàn diện', desc: 'Mọi rủi ro bất ngờ', price: 'Từ 2.5M/năm' },
              ].map(plan => (
                <label key={plan.value}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.coverage_type === plan.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="coverage_type" value={plan.value}
                    checked={formData.coverage_type === plan.value}
                    onChange={e => updateField('coverage_type', e.target.value)}
                    className="hidden" />
                  <p className="font-bold text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  <p className="text-xs text-blue-600 font-medium mt-2">{plan.price}</p>
                </label>
              ))}
            </div>
          </div>

          {coverageOptions && (
            <div>
              <label className="block text-sm font-medium mb-3">Quyền lợi bổ sung</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {coverageOptions.additional_coverages.map((opt: any) => (
                  <label key={opt.code} className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={formData.additional_coverages.includes(opt.code)}
                      onChange={() => toggleArrayItem('additional_coverages', opt.code)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{opt.name}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('property')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Quay lại</button>
            <button onClick={() => setStep('security')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tiếp theo</button>
          </div>
        </div>
      )}

      {/* Step 3: Security */}
      {step === 'security' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tính Năng An Ninh</h2>
          <p className="text-sm text-gray-600">Chọn các tính năng an ninh có sẵn tại nhà bạn để được giảm phí</p>

          {coverageOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {coverageOptions.security_features.map((feat: any) => (
                <label key={feat.code} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={formData.security_features.includes(feat.code)}
                    onChange={() => toggleArrayItem('security_features', feat.code)}
                    className="rounded border-gray-300 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{feat.name}</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">-{feat.discount}</span>
                </label>
              ))}
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            Giảm phí tối đa 15% khi có đầy đủ trang thiết bị an ninh.
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('coverage')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Quay lại</button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Đang tính phí...' : 'Xem kết quả'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Kết Quả Báo Giá - {result.plan_name}</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-blue-600">Phí bảo hiểm {result.duration_months} tháng</p>
              <p className="text-3xl font-bold text-blue-800">{result.total_premium.toLocaleString('vi-VN')} VND</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-600">Phí BH nhà</span>
                <span>{result.building_premium.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-600">Phí BH nội thất</span>
                <span>{result.contents_premium.toLocaleString('vi-VN')} VND</span>
              </div>
              {result.additional_premiums.map((ap: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">{ap.name}</span>
                  <span>{ap.premium.toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
              {result.discount_amount > 0 && (
                <div className="flex justify-between py-1 border-b text-green-600">
                  <span>Giảm phí an ninh</span>
                  <span>-{result.discount_amount.toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-600">Thuế VAT (10%)</span>
                <span>{result.tax.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base">
                <span>Tổng thanh toán</span>
                <span className="text-blue-600">{result.total_premium.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            {result.discount_reasons.length > 0 && (
              <div className="mt-4 bg-green-50 p-3 rounded text-sm">
                <p className="font-medium text-green-800 mb-1">Giảm giá áp dụng:</p>
                {result.discount_reasons.map((r: string, idx: number) => (
                  <p key={idx} className="text-green-700">• {r}</p>
                ))}
              </div>
            )}
          </div>

          {/* Coverage Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Chi Tiết Bảo Hiểm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">STBH Nhà</p>
                <p className="font-bold">{result.coverage_details.building.sum_insured.toLocaleString('vi-VN')} VND</p>
                <p className="text-xs text-gray-400">Khấu trừ: {result.coverage_details.building.deductible.toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">STBH Nội thất</p>
                <p className="font-bold">{result.coverage_details.contents.sum_insured.toLocaleString('vi-VN')} VND</p>
                <p className="text-xs text-gray-400">Khấu trừ: {result.coverage_details.contents.deductible.toLocaleString('vi-VN')} VND</p>
              </div>
              {result.coverage_details.liability && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500">Trách nhiệm dân sự</p>
                  <p className="font-bold">{result.coverage_details.liability.limit.toLocaleString('vi-VN')} VND</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('security')} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">Điều chỉnh</button>
            <button onClick={() => navigate('/purchase')} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Mua ngay</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeQuotePage;
