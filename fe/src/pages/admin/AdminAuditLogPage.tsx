import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface AuditEntry {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    user_id: '',
  });

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), per_page: '20' });
      if (filters.action) params.append('action', filters.action);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      if (filters.user_id) params.append('user_id', filters.user_id);

      const res = await api.get(`/admin/analytics/audit-logs?${params}`);
      setLogs(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      approve: 'bg-emerald-100 text-emerald-800',
      reject: 'bg-red-100 text-red-800',
      payment: 'bg-yellow-100 text-yellow-800',
      export: 'bg-gray-100 text-gray-800',
    };
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-4">
        <select
          value={filters.action}
          onChange={(e) => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tất cả hành động</option>
          <option value="create">Tạo mới</option>
          <option value="update">Cập nhật</option>
          <option value="delete">Xóa</option>
          <option value="login">Đăng nhập</option>
          <option value="approve">Duyệt</option>
          <option value="reject">Từ chối</option>
          <option value="payment">Thanh toán</option>
          <option value="export">Xuất</option>
        </select>

        <select
          value={filters.resource_type}
          onChange={(e) => { setFilters(f => ({ ...f, resource_type: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tất cả resource</option>
          <option value="customer">Khách hàng</option>
          <option value="policy">Hợp đồng</option>
          <option value="claim">Claims</option>
          <option value="payment">Thanh toán</option>
          <option value="product">Sản phẩm</option>
          <option value="order">Đơn hàng</option>
        </select>

        <input
          type="text"
          placeholder="User ID..."
          value={filters.user_id}
          onChange={(e) => { setFilters(f => ({ ...f, user_id: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
        />
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Hành động</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="px-4 py-3 text-left">Chi tiết</th>
                <th className="px-4 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{log.user_email}</p>
                    <p className="text-xs text-gray-500">{log.user_role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{log.resource_type}</p>
                    {log.resource_id && <p className="text-xs text-gray-400 font-mono">{log.resource_id.slice(0, 8)}...</p>}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">
                    {JSON.stringify(log.details).slice(0, 60)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">Tổng: {total} records</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">Trang {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={logs.length < 20}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;
