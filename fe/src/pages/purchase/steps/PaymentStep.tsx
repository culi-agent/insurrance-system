import React, { useState } from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { purchaseService } from '@/services/purchaseService';

const PAYMENT_METHODS = [
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
    icon: '🏦',
  },
  {
    id: 'momo',
    name: 'Momo',
    description: 'Thanh toán qua ví điện tử Momo',
    icon: '💜',
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản trực tiếp qua ngân hàng',
    icon: '🏧',
  },
];

const PaymentStep: React.FC = () => {
  const { currentOrder, prevStep, setError } = usePurchaseStore();
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ payment_url: string; expires_at: string } | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handlePayment = async () => {
    if (!currentOrder) {
      setError('Không tìm thấy đơn hàng');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const result = await purchaseService.initiatePayment(currentOrder.id, {
        payment_method: selectedMethod,
        return_url: `${window.location.origin}/purchase/result`,
      });

      if (result.payment_url) {
        setPaymentResult({
          payment_url: result.payment_url,
          expires_at: result.expires_at,
        });
        // In real app, redirect to payment gateway
        // window.location.href = result.payment_url;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi khởi tạo thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentResult) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang chuyển đến cổng thanh toán</h3>
        <p className="text-gray-600 mb-6">
          Vui lòng hoàn tất thanh toán trên trang của nhà cung cấp
        </p>
        <a
          href={paymentResult.payment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Mở trang thanh toán
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <p className="text-sm text-gray-500 mt-4">
          Hết hạn: {new Date(paymentResult.expires_at).toLocaleString('vi-VN')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Thanh Toán</h2>
      <p className="text-gray-600 mb-6">Chọn phương thức thanh toán phù hợp</p>

      {/* Payment Amount */}
      {currentOrder && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6">
          <p className="text-blue-100 text-sm">Tổng thanh toán</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(currentOrder.premium.total)}</p>
          <p className="text-blue-200 text-sm mt-1">
            Đơn hàng: {currentOrder.order_number}
          </p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <span className="text-2xl mr-4">{method.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            {selectedMethod === method.id && (
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </label>
        ))}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg mb-6">
        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div className="text-sm text-green-800">
          <p className="font-medium">Thanh toán an toàn & bảo mật</p>
          <p>Thông tin thanh toán được mã hóa SSL 256-bit</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </button>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            `Thanh toán ${currentOrder ? formatCurrency(currentOrder.premium.total) : ''}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
