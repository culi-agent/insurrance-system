import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  kyc_status: string;
  created_at: string;
}

const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, per_page: 50 };
      if (search) params.search = search;
      const res = await api.get('/admin/customers', { params });
      setCustomers(res.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Hoạt động', inactive: 'Chưa kích hoạt', suspended: 'Bị khóa',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
          <p className="text-gray-500 mt-1">{customers.length} khách hàng</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Khách hàng</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Điện thoại</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">KYC</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Ngày đăng ký</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có khách hàng nào</td></tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{customer.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3">{getStatusBadge(customer.status)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>{customer.kyc_status === 'verified' ? 'Đã xác minh' : 'Chờ xác minh'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(customer.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm mr-3">Chi tiết</button>
                    <button className="text-red-600 hover:text-red-700 text-sm">Khóa</button>
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

export default AdminCustomersPage;
