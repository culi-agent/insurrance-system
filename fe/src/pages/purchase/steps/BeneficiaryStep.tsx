import React, { useState } from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { purchaseService } from '@/services/purchaseService';
import type { BeneficiaryInfo } from '@/types/purchase';

const BeneficiaryStep: React.FC = () => {
  const {
    beneficiaries,
    addBeneficiary,
    removeBeneficiary,
    currentOrder,
    nextStep,
    prevStep,
    setCurrentOrder,
    setError,
  } = usePurchaseStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<BeneficiaryInfo>>({
    full_name: '',
    relationship: '',
    id_number: '',
    percentage: 100,
  });

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  const handleAddBeneficiary = () => {
    if (!form.full_name || !form.relationship || !form.id_number || !form.percentage) {
      return;
    }

    if (totalPercentage + (form.percentage || 0) > 100) {
      setError('Tổng tỷ lệ thụ hưởng không được vượt 100%');
      return;
    }

    addBeneficiary(form as BeneficiaryInfo);
    setForm({ full_name: '', relationship: '', id_number: '', percentage: 0 });
    setShowForm(false);
  };

  const handleContinue = async () => {
    try {
      if (currentOrder && beneficiaries.length > 0) {
        const updated = await purchaseService.updateWizardStep(currentOrder.id, 2, {
          beneficiary_info: beneficiaries,
        });
        setCurrentOrder(updated);
      }
      nextStep();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Người Thụ Hưởng</h2>
      <p className="text-gray-600 mb-6">
        Thêm thông tin người thụ hưởng (không bắt buộc). Nếu bỏ qua, người mua bảo hiểm sẽ là người thụ hưởng.
      </p>

      {/* Beneficiary List */}
      {beneficiaries.length > 0 && (
        <div className="mb-6 space-y-3">
          {beneficiaries.map((b, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
            >
              <div>
                <p className="font-medium text-gray-900">{b.full_name}</p>
                <p className="text-sm text-gray-600">
                  {b.relationship} - CCCD: {b.id_number} - {b.percentage}%
                </p>
              </div>
              <button
                onClick={() => removeBeneficiary(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <p className="text-sm text-gray-500">
            Tổng tỷ lệ: <span className={totalPercentage > 100 ? 'text-red-500' : 'text-green-600'}>{totalPercentage}%</span>
          </p>
        </div>
      )}

      {/* Add Form */}
      {showForm ? (
        <div className="border rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                value={form.full_name || ''}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nguyễn Văn B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ</label>
              <select
                value={form.relationship || ''}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn quan hệ</option>
                <option value="Vợ/Chồng">Vợ/Chồng</option>
                <option value="Con">Con</option>
                <option value="Cha/Mẹ">Cha/Mẹ</option>
                <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD</label>
              <input
                value={form.id_number || ''}
                onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="079123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ (%)</label>
              <input
                type="number"
                min={1}
                max={100 - totalPercentage}
                value={form.percentage || ''}
                onChange={(e) => setForm({ ...form, percentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddBeneficiary}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thêm
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 w-full justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm người thụ hưởng
        </button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default BeneficiaryStep;
