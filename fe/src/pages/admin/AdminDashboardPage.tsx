import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface DashboardStats {
  products: { total: number; active: number };
  categories: { total: number };
  insurers: { total: number };
  orders: { total: number; this_month: number };
  revenue: { total: number; this_month: number };
  customers: { total: number; new_this_month: number };
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sản phẩm</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.products.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">{stats?.products.active || 0} đang hoạt động</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.customers.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">+{stats?.customers.new_this_month || 0} tháng này</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đơn hàng tháng này</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.orders.this_month || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Tổng: {stats?.orders.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🛒</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.revenue.this_month || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Tổng: {formatCurrency(stats?.revenue.total || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-xl">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Nhà bảo hiểm đối tác</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.insurers.total || 5}</p>
          <p className="text-sm text-gray-500 mt-1">Bảo Việt, PVI, Bảo Minh, Manulife, Dai-ichi</p>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Danh mục sản phẩm</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.categories.total || 7}</p>
          <p className="text-sm text-gray-500 mt-1">Xe, Sức khỏe, Du lịch, Nhân thọ, Tài sản, TNDS, DN</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
