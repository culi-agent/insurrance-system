import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseService } from '@/services/purchaseService';
import type { Policy } from '@/types/purchase';

const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const status = filter === 'all' ? undefined : filter;
        const result = await purchaseService.getMyPolicies(1, 50, status);
        setPolicies(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, [filter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Hiệu lực';
      case 'expired': return 'Hết hạn';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'motor': return '🚗';
      case 'travel': return '✈️';
      case 'health': return '🏥';
      case 'life': return '❤️';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hợp Đồng Bảo Hiểm</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả hợp đồng của bạn</p>
          </div>
          <Link to="/categories" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Mua thêm
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'active', label: 'Hiệu lực' },
            { value: 'expired', label: 'Hết hạn' },
            { value: 'cancelled', label: 'Đã hủy' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Policy List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <Link
                key={policy.id}
                to={`/dashboard/policies/${policy.id}`}
                className="block bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                      {getInsuranceIcon(policy.insurance_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{policy.policy_number}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                          {getStatusLabel(policy.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{policy.plan_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Hiệu lực: {new Date(policy.effective_date).toLocaleDateString('vi-VN')}</span>
                        <span>→</span>
                        <span>Hết hạn: {new Date(policy.expiry_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(policy.premium_amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{policy.payment_frequency === 'one_time' ? 'Một lần' : policy.payment_frequency}</p>
                    {policy.policy_document_url && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tải tài liệu
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 mb-4">Không tìm thấy hợp đồng nào</p>
            <Link to="/categories" className="text-blue-600 hover:underline">Mua bảo hiểm ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliciesPage;
