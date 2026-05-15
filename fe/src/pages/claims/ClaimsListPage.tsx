import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

interface ClaimItem {
  id: string;
  claim_number: string;
  claim_type: string;
  incident_date: string;
  claim_amount: number;
  status: string;
  submitted_at: string;
}

const ClaimsListPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get('/claims');
        setClaims(res.data.data?.data || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetchClaims();
  }, []);

  const formatCurrency = (amount: number) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + 'đ' : '-';

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      submitted: { label: 'Đã gửi', color: 'bg-blue-100 text-blue-800', icon: '📤' },
      under_review: { label: 'Đang xem xét', color: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
      documents_requested: { label: 'Yêu cầu bổ sung', color: 'bg-orange-100 text-orange-800', icon: '📎' },
      approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800', icon: '✅' },
      rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: '❌' },
      settled: { label: 'Đã chi trả', color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
      closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800', icon: '🔒' },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '📋' };
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu Cầu Bồi Thường</h1>
            <p className="text-gray-500 mt-1">Theo dõi trạng thái các yêu cầu</p>
          </div>
          <Link to="/claims/submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + Gửi yêu cầu mới
          </Link>
        </div>

        {claims.length > 0 ? (
          <div className="space-y-4">
            {claims.map((claim) => {
              const statusInfo = getStatusInfo(claim.status);
              return (
                <Link key={claim.id} to={`/dashboard/claims/${claim.id}`} className="block bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{statusInfo.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{claim.claim_number}</p>
                        <p className="text-sm text-gray-500">
                          {claim.claim_type} - Ngày xảy ra: {new Date(claim.incident_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      {claim.claim_amount && <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(claim.claim_amount)}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <span className="text-5xl block mb-4">📋</span>
            <p className="text-gray-500 mb-4">Bạn chưa có yêu cầu bồi thường nào</p>
            <Link to="/claims/submit" className="text-blue-600 hover:underline">Gửi yêu cầu bồi thường</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsListPage;
