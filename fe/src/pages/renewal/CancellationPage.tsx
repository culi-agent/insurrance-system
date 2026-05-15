import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';

const CancellationPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }

    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/renewal/${policyId}/cancel`, {
        reason,
        refund_method: refundMethod,
      });
      setResult(res.data.data);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hợp đồng đã được hủy</h2>
          <p className="text-gray-600 mb-4">{result.policy_number}</p>

          {result.refund.eligible && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mt-4">
              <h3 className="font-semibold text-green-800 mb-2">Thông tin hoàn tiền</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p>Tổng hoàn: <span className="font-medium">{result.refund.gross_amount.toLocaleString('vi-VN')} VND</span></p>
                <p>Phí hủy (10%): <span className="font-medium">-{result.refund.cancellation_fee.toLocaleString('vi-VN')} VND</span></p>
                <p className="text-base font-bold border-t border-green-300 pt-1">
                  Thực nhận: {result.refund.net_refund.toLocaleString('vi-VN')} VND
                </p>
                <p className="text-xs text-green-600 mt-2">
                  ({result.refund.calculation.days_remaining} ngày còn lại / {result.refund.calculation.total_days} tổng ngày)
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">{result.message}</p>

          <button
            onClick={() => navigate('/dashboard/policies')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về danh sách hợp đồng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hủy Hợp Đồng Bảo Hiểm</h1>
        <p className="text-gray-600 mt-1">Vui lòng cho biết lý do hủy hợp đồng</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm font-medium">
            Lưu ý: Hủy hợp đồng sẽ tính hoàn tiền theo tỷ lệ pro-rata (trừ phí hủy 10%).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hủy *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập lý do hủy hợp đồng..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức hoàn tiền</label>
          <select
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="bank_transfer">Chuyển khoản ngân hàng</option>
            <option value="original_method">Hoàn về phương thức thanh toán gốc</option>
          </select>
        </div>

        {confirmed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-bold">
              Bạn có chắc chắn muốn hủy? Hành động này không thể hoàn tác.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : confirmed ? 'Xác nhận hủy' : 'Hủy hợp đồng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationPage;
