import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('vnp_ResponseCode') === '00' ? 'success' : 
                 searchParams.get('resultCode') === '0' ? 'success' : 'failed';

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh Toán Thành Công!</h1>
            <p className="text-gray-600 mb-6">
              Hợp đồng bảo hiểm của bạn đã được phát hành. Vui lòng kiểm tra email để nhận tài liệu.
            </p>
            <div className="space-y-3">
              <Link
                to="/dashboard/policies"
                className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Xem hợp đồng của tôi
              </Link>
              <Link
                to="/"
                className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh Toán Thất Bại</h1>
          <p className="text-gray-600 mb-6">
            Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <div className="space-y-3">
            <Link
              to="/purchase/orders"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
