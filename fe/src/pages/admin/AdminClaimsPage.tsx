import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ClaimItem {
  id: string;
  claim_number: string;
  claim_type: string;
  status: string;
  priority: string;
  claim_amount: number;
  submitted_at: string;
  assigned_to: string | null;
}

const AdminClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, per_page: 50 };
      if (filter) params.status = filter;
      const res = await api.get('/admin/claims/queue', { params });
      setClaims(res.data.data?.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + 'đ' : '-';

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      submitted: { label: 'Mới', color: 'bg-blue-100 text-blue-800' },
      under_review: { label: 'Đang xem xét', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
      settled: { label: 'Đã chi trả', color: 'bg-emerald-100 text-emerald-800' },
    };
    const m = map[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.color}`}>{m.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = { urgent: 'text-red-600', high: 'text-orange-600', normal: 'text-gray-600', low: 'text-gray-400' };
    return <span className={`text-xs font-medium ${map[priority] || 'text-gray-600'}`}>{priority === 'urgent' ? 'Khẩn cấp' : priority === 'high' ? 'Cao' : priority === 'low' ? 'Thấp' : 'Bình thường'}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bồi Thường</h1>
          <p className="text-gray-500 mt-1">Xử lý yêu cầu bồi thường từ khách hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { value: '', label: 'Tất cả' },
          { value: 'submitted', label: 'Mới' },
          { value: 'under_review', label: 'Đang xem xét' },
          { value: 'approved', label: 'Đã duyệt' },
          { value: 'rejected', label: 'Từ chối' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Mã YC</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Loại</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Số tiền</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Ưu tiên</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Ngày gửi</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : claims.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có yêu cầu nào</td></tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">{claim.claim_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{claim.claim_type}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(claim.claim_amount)}</td>
                  <td className="px-4 py-3">{getPriorityBadge(claim.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(claim.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(claim.submitted_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Xem</button>
                    {claim.status === 'submitted' && <button className="text-green-600 hover:text-green-700 text-sm">Nhận xử lý</button>}
                    {claim.status === 'under_review' && (
                      <>
                        <button className="text-green-600 hover:text-green-700 text-sm">Duyệt</button>
                        <button className="text-red-600 hover:text-red-700 text-sm">Từ chối</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClaimsPage;
