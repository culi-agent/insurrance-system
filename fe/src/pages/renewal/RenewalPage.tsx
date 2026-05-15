import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface EligiblePolicy {
  id: string;
  policy_number: string;
  insurance_type: string;
  plan_name: string;
  expiry_date: string;
  premium_amount: number;
  auto_renewal: boolean;
  days_until_expiry: number;
}

const RenewalPage: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<EligiblePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEligiblePolicies();
  }, []);

  const fetchEligiblePolicies = async () => {
    try {
      const res = await api.get('/renewal/eligible');
      setPolicies(res.data.data);
    } catch (error) {
      console.error('Failed to fetch eligible policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (policyId: string) => {
    setRenewingId(policyId);
    try {
      const res = await api.post(`/renewal/${policyId}/renew`, {});
      alert(`Gia hạn thành công! Hợp đồng mới: ${res.data.data.new_policy.policy_number}`);
      fetchEligiblePolicies();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setRenewingId(null);
    }
  };

  const handleToggleAutoRenewal = async (policyId: string, currentState: boolean) => {
    try {
      await api.put(`/renewal/${policyId}/auto-renewal`, { enabled: !currentState });
      setPolicies(prev => prev.map(p =>
        p.id === policyId ? { ...p, auto_renewal: !currentState } : p
      ));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 3) return 'bg-red-100 text-red-800';
    if (days <= 7) return 'bg-orange-100 text-orange-800';
    if (days <= 14) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gia Hạn Bảo Hiểm</h1>
        <p className="text-gray-600 mt-1">Các hợp đồng sắp hết hạn cần gia hạn</p>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tất cả hợp đồng đều còn hiệu lực</h3>
          <p className="mt-1 text-sm text-gray-500">Không có hợp đồng nào cần gia hạn trong 30 ngày tới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <div key={policy.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{policy.policy_number}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getExpiryBadge(policy.days_until_expiry)}`}>
                      Còn {policy.days_until_expiry} ngày
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {policy.insurance_type === 'motor' && 'Bảo hiểm xe'}
                    {policy.insurance_type === 'travel' && 'Bảo hiểm du lịch'}
                    {policy.insurance_type === 'health' && 'Bảo hiểm sức khỏe'}
                    {policy.insurance_type === 'life' && 'Bảo hiểm nhân thọ'}
                    {' - '}{policy.plan_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hết hạn: {new Date(policy.expiry_date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Phí BH: {Number(policy.premium_amount).toLocaleString('vi-VN')} VND
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleRenew(policy.id)}
                    disabled={renewingId === policy.id}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {renewingId === policy.id ? 'Đang xử lý...' : 'Gia hạn ngay'}
                  </button>

                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.auto_renewal}
                      onChange={() => handleToggleAutoRenewal(policy.id, policy.auto_renewal)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Tự động gia hạn
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenewalPage;
