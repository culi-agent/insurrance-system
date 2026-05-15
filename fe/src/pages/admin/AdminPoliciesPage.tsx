import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PolicyItem {
  id: string;
  policy_number: string;
  insurance_type: string;
  customer_name: string;
  premium_amount: number;
  status: string;
  effective_date: string;
  expiry_date: string;
}

const AdminPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPolicies();
  }, [filter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // In production: call admin policy endpoint
      // Simulated data for now
      setPolicies([]);
    } catch { }
    finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      motor: { label: 'Xe cơ giới', color: 'bg-blue-100 text-blue-800' },
      health: { label: 'Sức khỏe', color: 'bg-green-100 text-green-800' },
      travel: { label: 'Du lịch', color: 'bg-purple-100 text-purple-800' },
    };
    const m = map[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.color}`}>{m.label}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Hợp Đồng</h1>
          <p className="text-gray-500 mt-1">Xem và quản lý tất cả hợp đồng bảo hiểm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'expired', 'cancelled'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'Tất cả' : f === 'active' ? 'Hiệu lực' : f === 'expired' ? 'Hết hạn' : 'Đã hủy'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Số HĐ</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Loại</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Khách hàng</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Phí BH</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Hiệu lực</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : policies.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có hợp đồng nào</td></tr>
            ) : (
              policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">{p.policy_number}</td>
                  <td className="px-4 py-3">{getTypeBadge(p.insurance_type)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.customer_name}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(p.premium_amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.effective_date} - {p.expiry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>{p.status === 'active' ? 'Hiệu lực' : p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Chi tiết</button>
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

export default AdminPoliciesPage;
