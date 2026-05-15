import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { purchaseService } from '@/services/purchaseService';
import type { Policy } from '@/types/purchase';

const PolicyDetailPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!policyId) return;
      try {
        const result = await purchaseService.getPolicyDetail(policyId);
        setPolicy(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [policyId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy hợp đồng</p>
          <Link to="/dashboard/policies" className="text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
            <li>/</li>
            <li><Link to="/dashboard/policies" className="hover:text-blue-600">Hợp đồng</Link></li>
            <li>/</li>
            <li className="text-gray-900">{policy.policy_number}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{policy.policy_number}</h1>
              <p className="text-gray-600 mt-1">{policy.plan_name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {policy.status === 'active' ? 'Đang hiệu lực' : policy.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-500">Loại bảo hiểm</p>
              <p className="font-medium mt-0.5">{policy.insurance_type === 'motor' ? 'Xe cơ giới' : policy.insurance_type === 'travel' ? 'Du lịch' : 'Sức khỏe'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày hiệu lực</p>
              <p className="font-medium mt-0.5">{new Date(policy.effective_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày hết hạn</p>
              <p className="font-medium mt-0.5">{new Date(policy.expiry_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phí bảo hiểm</p>
              <p className="font-medium mt-0.5 text-blue-600">{formatCurrency(policy.premium_amount)}</p>
            </div>
          </div>
        </div>

        {/* Insured Info */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin người được bảo hiểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium ml-2">{policy.insured_info.full_name}</span></div>
            <div><span className="text-gray-500">Số CCCD:</span> <span className="font-medium ml-2">{policy.insured_info.id_number}</span></div>
            <div><span className="text-gray-500">Ngày sinh:</span> <span className="font-medium ml-2">{policy.insured_info.date_of_birth}</span></div>
            <div><span className="text-gray-500">Điện thoại:</span> <span className="font-medium ml-2">{policy.insured_info.phone}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500">Địa chỉ:</span> <span className="font-medium ml-2">{policy.insured_info.address}</span></div>
          </div>
        </div>

        {/* Coverage Details */}
        {policy.coverage_details && (
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quyền lợi bảo hiểm</h2>
            {policy.coverage_details.coverage_items && (
              <div className="space-y-3">
                {policy.coverage_details.coverage_items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                    </div>
                    <p className="font-medium text-blue-600">{formatCurrency(item.limit)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tài liệu</h2>
          <div className="space-y-3">
            {policy.policy_document_url && (
              <a href={policy.policy_document_url} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Hợp đồng bảo hiểm (PDF)</p>
                  <p className="text-sm text-gray-500">Tải xuống bản đầy đủ</p>
                </div>
              </a>
            )}
            {policy.certificate_url && (
              <a href={policy.certificate_url} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Giấy chứng nhận bảo hiểm</p>
                  <p className="text-sm text-gray-500">Bản rút gọn</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/dashboard/policies" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailPage;
