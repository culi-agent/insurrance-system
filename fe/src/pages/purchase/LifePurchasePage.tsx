import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';

type PurchaseStep = 'beneficiary' | 'payment_option' | 'review' | 'complete';

interface Beneficiary {
  full_name: string;
  relationship: string;
  id_number: string;
  date_of_birth: string;
  phone: string;
  percentage: number;
  type: 'primary' | 'contingent';
}

const LifePurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('quotation_id');
  const [step, setStep] = useState<PurchaseStep>('beneficiary');
  const [loading, setLoading] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { full_name: '', relationship: '', id_number: '', date_of_birth: '', phone: '', percentage: 100, type: 'primary' },
  ]);

  const [paymentOption, setPaymentOption] = useState({
    frequency: 'annual' as 'monthly' | 'quarterly' | 'semi_annual' | 'annual',
    method: 'vnpay',
    installment: false,
  });

  const addBeneficiary = (type: 'primary' | 'contingent') => {
    setBeneficiaries(prev => [...prev, {
      full_name: '', relationship: '', id_number: '', date_of_birth: '', phone: '',
      percentage: 0, type,
    }]);
  };

  const updateBeneficiary = (index: number, field: string, value: any) => {
    setBeneficiaries(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPurchase = async () => {
    setLoading(true);
    try {
      // In real flow: create order → payment → policy issuance
      // Simplified for demo
      const res = await api.post('/purchase', {
        quotation_id: quotationId,
        beneficiary_info: beneficiaries,
        payment_frequency: paymentOption.frequency,
        payment_method: paymentOption.method,
        use_installment: paymentOption.installment,
      });

      setStep('complete');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const validateBeneficiaries = () => {
    const primaryBeneficiaries = beneficiaries.filter(b => b.type === 'primary');
    if (primaryBeneficiaries.length === 0) {
      alert('Vui lòng thêm ít nhất 1 người thụ hưởng chính');
      return false;
    }
    const total = primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (total !== 100) {
      alert('Tổng tỷ lệ người thụ hưởng chính phải bằng 100%');
      return false;
    }
    for (const b of primaryBeneficiaries) {
      if (!b.full_name || !b.id_number || !b.relationship) {
        alert('Vui lòng điền đầy đủ thông tin người thụ hưởng');
        return false;
      }
    }
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hoàn Tất Mua BH Nhân Thọ</h1>

      {/* Step 1: Beneficiary */}
      {step === 'beneficiary' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold">Người Thụ Hưởng</h2>
          <p className="text-sm text-gray-600">Người được nhận quyền lợi BH khi có sự kiện bảo hiểm xảy ra.</p>

          {/* Primary beneficiaries */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Người thụ hưởng chính</h3>
            {beneficiaries.filter(b => b.type === 'primary').map((ben, idx) => {
              const realIdx = beneficiaries.indexOf(ben);
              return (
                <div key={realIdx} className="border rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Người thụ hưởng #{idx + 1}</span>
                    {idx > 0 && (
                      <button onClick={() => removeBeneficiary(realIdx)} className="text-red-500 text-sm hover:underline">
                        Xóa
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Họ tên *" value={ben.full_name}
                      onChange={e => updateBeneficiary(realIdx, 'full_name', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <select value={ben.relationship}
                      onChange={e => updateBeneficiary(realIdx, 'relationship', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm">
                      <option value="">Quan hệ *</option>
                      <option value="spouse">Vợ/Chồng</option>
                      <option value="child">Con</option>
                      <option value="parent">Bố/Mẹ</option>
                      <option value="sibling">Anh/Chị/Em</option>
                      <option value="other">Khác</option>
                    </select>
                    <input placeholder="Số CCCD *" value={ben.id_number}
                      onChange={e => updateBeneficiary(realIdx, 'id_number', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <input type="date" value={ben.date_of_birth}
                      onChange={e => updateBeneficiary(realIdx, 'date_of_birth', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <input placeholder="SĐT" value={ben.phone}
                      onChange={e => updateBeneficiary(realIdx, 'phone', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={ben.percentage}
                        onChange={e => updateBeneficiary(realIdx, 'percentage', parseInt(e.target.value) || 0)}
                        className="border rounded-lg px-3 py-2 text-sm w-20" />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => addBeneficiary('primary')} className="text-blue-600 text-sm hover:underline">
              + Thêm người thụ hưởng chính
            </button>
          </div>

          {/* Contingent beneficiaries */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">Người thụ hưởng dự phòng (tùy chọn)</h3>
            {beneficiaries.filter(b => b.type === 'contingent').map((ben, idx) => {
              const realIdx = beneficiaries.indexOf(ben);
              return (
                <div key={realIdx} className="border border-dashed rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Dự phòng #{idx + 1}</span>
                    <button onClick={() => removeBeneficiary(realIdx)} className="text-red-500 text-sm hover:underline">Xóa</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Họ tên" value={ben.full_name}
                      onChange={e => updateBeneficiary(realIdx, 'full_name', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <select value={ben.relationship}
                      onChange={e => updateBeneficiary(realIdx, 'relationship', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm">
                      <option value="">Quan hệ</option>
                      <option value="spouse">Vợ/Chồng</option>
                      <option value="child">Con</option>
                      <option value="parent">Bố/Mẹ</option>
                      <option value="other">Khác</option>
                    </select>
                    <input placeholder="Số CCCD" value={ben.id_number}
                      onChange={e => updateBeneficiary(realIdx, 'id_number', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm" />
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={ben.percentage}
                        onChange={e => updateBeneficiary(realIdx, 'percentage', parseInt(e.target.value) || 0)}
                        className="border rounded-lg px-3 py-2 text-sm w-20" />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => addBeneficiary('contingent')} className="text-gray-500 text-sm hover:underline">
              + Thêm người thụ hưởng dự phòng
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => { if (validateBeneficiaries()) setStep('payment_option'); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment option */}
      {step === 'payment_option' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold">Tùy Chọn Thanh Toán</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Tần suất đóng phí</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'annual', label: 'Hàng năm', desc: 'Không phụ phí' },
                { value: 'semi_annual', label: '6 tháng/lần', desc: '+2% phụ phí' },
                { value: 'quarterly', label: 'Hàng quý', desc: '+3% phụ phí' },
                { value: 'monthly', label: 'Hàng tháng', desc: '+5% phụ phí' },
              ].map(opt => (
                <label key={opt.value}
                  className={`border rounded-lg p-3 cursor-pointer ${paymentOption.frequency === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="frequency" value={opt.value}
                    checked={paymentOption.frequency === opt.value}
                    onChange={e => setPaymentOption(p => ({ ...p, frequency: e.target.value as any }))}
                    className="hidden" />
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
            <div className="space-y-2">
              {[
                { value: 'vnpay', label: 'VNPay (ATM/Visa/Master)' },
                { value: 'momo', label: 'Ví MoMo' },
                { value: 'zalopay', label: 'ZaloPay' },
                { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="method" value={opt.value}
                    checked={paymentOption.method === opt.value}
                    onChange={e => setPaymentOption(p => ({ ...p, method: e.target.value }))}
                    className="text-blue-600" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {paymentOption.frequency !== 'annual' && (
            <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
              <input type="checkbox" checked={paymentOption.installment}
                onChange={e => setPaymentOption(p => ({ ...p, installment: e.target.checked }))}
                className="rounded text-blue-600" />
              <div>
                <p className="font-medium text-sm">Thanh toán trả góp tự động</p>
                <p className="text-xs text-gray-600">Tự động trích tiền theo lịch đóng phí</p>
              </div>
            </label>
          )}

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('beneficiary')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Quay lại</button>
            <button onClick={() => setStep('review')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Xem lại</button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Xác Nhận Đơn Hàng</h2>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-sm text-gray-500 mb-2">Người thụ hưởng</h3>
            {beneficiaries.filter(b => b.full_name).map((b, idx) => (
              <div key={idx} className="flex justify-between py-1 text-sm">
                <span>{b.full_name} ({b.relationship})</span>
                <span>{b.percentage}% - {b.type === 'primary' ? 'Chính' : 'Dự phòng'}</span>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-sm text-gray-500 mb-2">Thanh toán</h3>
            <p className="text-sm">Tần suất: {paymentOption.frequency === 'annual' ? 'Hàng năm' : paymentOption.frequency === 'monthly' ? 'Hàng tháng' : paymentOption.frequency === 'quarterly' ? 'Hàng quý' : '6 tháng'}</p>
            <p className="text-sm">Phương thức: {paymentOption.method.toUpperCase()}</p>
            {paymentOption.installment && <p className="text-sm text-blue-600">Trả góp tự động: Bật</p>}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep('payment_option')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Quay lại</button>
            <button onClick={handleSubmitPurchase} disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
              {loading ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-6">Đơn hàng BH nhân thọ đã được ghi nhận. Vui lòng hoàn tất thanh toán.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard/policies')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Xem hợp đồng
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifePurchasePage;
