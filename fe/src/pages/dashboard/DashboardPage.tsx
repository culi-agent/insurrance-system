import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { purchaseService } from '@/services/purchaseService';
import type { Policy, PurchaseOrder } from '@/types/purchase';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, ordersRes] = await Promise.all([
          purchaseService.getMyPolicies(1, 5),
          purchaseService.getMyOrders(1, 5),
        ]);
        setPolicies(policiesRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-600',
      paid: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      active: 'Đang hiệu lực',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy',
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      draft: 'Nháp',
      paid: 'Đã thanh toán',
      pending_payment: 'Chờ thanh toán',
      pending_ekyc: 'Chờ xác minh',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user?.full_name || 'Khách hàng'}!
          </h1>
          <p className="text-gray-600 mt-1">Quản lý bảo hiểm của bạn tại đây</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{policies.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-gray-500">Hợp đồng hiệu lực</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{policies.filter(p => p.status === 'expired').length}</p>
                <p className="text-sm text-gray-500">Sắp hết hạn</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-sm text-gray-500">Đơn hàng</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Yêu cầu bồi thường</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border shadow-sm mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Mua bảo hiểm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/quotation/motor" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="text-3xl mb-2">🚗</span>
              <span className="text-sm font-medium text-gray-700">BH Xe cơ giới</span>
            </Link>
            <Link to="/quotation/travel" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="text-3xl mb-2">✈️</span>
              <span className="text-sm font-medium text-gray-700">BH Du lịch</span>
            </Link>
            <Link to="/quotation/health" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="text-3xl mb-2">🏥</span>
              <span className="text-sm font-medium text-gray-700">BH Sức khỏe</span>
            </Link>
            <Link to="/categories" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="text-3xl mb-2">📋</span>
              <span className="text-sm font-medium text-gray-700">Xem tất cả</span>
            </Link>
          </div>
        </div>

        {/* Active Policies */}
        <div className="bg-white rounded-xl border shadow-sm mb-8">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-gray-900">Hợp đồng bảo hiểm</h2>
            <Link to="/dashboard/policies" className="text-sm text-blue-600 hover:text-blue-700">
              Xem tất cả
            </Link>
          </div>
          {policies.length > 0 ? (
            <div className="divide-y">
              {policies.map((policy) => (
                <Link
                  key={policy.id}
                  to={`/dashboard/policies/${policy.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg">
                      {policy.insurance_type === 'motor' ? '🚗' : policy.insurance_type === 'travel' ? '✈️' : '🏥'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{policy.policy_number}</p>
                      <p className="text-sm text-gray-500">{policy.plan_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(policy.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      HH: {new Date(policy.expiry_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Bạn chưa có hợp đồng bảo hiểm nào</p>
              <Link to="/categories" className="text-blue-600 hover:underline mt-2 inline-block">
                Mua bảo hiểm ngay
              </Link>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
            <Link to="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700">
              Xem tất cả
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(order.premium.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
