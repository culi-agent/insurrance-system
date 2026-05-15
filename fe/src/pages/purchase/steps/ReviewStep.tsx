import React from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';

const ReviewStep: React.FC = () => {
  const { applicantInfo, beneficiaries, currentOrder, ekycResult, nextStep, prevStep } = usePurchaseStore();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Xem Lại Thông Tin</h2>
      <p className="text-gray-600 mb-6">
        Kiểm tra lại thông tin trước khi thanh toán
      </p>

      <div className="space-y-6">
        {/* Applicant Info */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin người mua
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Họ và tên:</span>
              <span className="ml-2 font-medium">{applicantInfo.full_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Số CCCD:</span>
              <span className="ml-2 font-medium">{applicantInfo.id_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Ngày sinh:</span>
              <span className="ml-2 font-medium">{applicantInfo.date_of_birth}</span>
            </div>
            <div>
              <span className="text-gray-500">Giới tính:</span>
              <span className="ml-2 font-medium">{applicantInfo.gender}</span>
            </div>
            <div>
              <span className="text-gray-500">Điện thoại:</span>
              <span className="ml-2 font-medium">{applicantInfo.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium">{applicantInfo.email}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500">Địa chỉ:</span>
              <span className="ml-2 font-medium">{applicantInfo.address}</span>
            </div>
          </div>
        </div>

        {/* Beneficiaries */}
        {beneficiaries.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Người thụ hưởng
            </h3>
            <div className="space-y-2">
              {beneficiaries.map((b, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{b.full_name} ({b.relationship})</span>
                  <span className="font-medium">{b.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* eKYC Status */}
        {ekycResult && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Xác minh danh tính
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Đã xác minh
              </span>
              <span className="text-sm text-gray-500">
                Độ chính xác: {Math.round(ekycResult.confidence_score * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Premium Summary */}
        {currentOrder && (
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chi tiết thanh toán
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phí bảo hiểm cơ bản:</span>
                <span>{formatCurrency(currentOrder.premium.base)}</span>
              </div>
              {currentOrder.premium.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(currentOrder.premium.discount)}</span>
                </div>
              )}
              {currentOrder.premium.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế VAT:</span>
                  <span>{formatCurrency(currentOrder.premium.tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Tổng thanh toán:</span>
                <span className="text-blue-600">{formatCurrency(currentOrder.premium.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </button>
        <button
          onClick={nextStep}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
