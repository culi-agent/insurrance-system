import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface KPIData {
  total_policies: number;
  active_policies: number;
  total_revenue: number;
  total_claims: number;
  claims_ratio: number;
  new_customers_this_month: number;
  conversion_rate: number;
  average_premium: number;
}

interface FunnelData {
  visitors: number;
  quote_started: number;
  quote_completed: number;
  purchase_started: number;
  payment_completed: number;
  policy_issued: number;
  rates: {
    quote_start_rate: number;
    quote_completion_rate: number;
    purchase_rate: number;
    payment_rate: number;
    overall_conversion: number;
  };
}

const AdminAnalyticsPage: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const [kpiRes, funnelRes, salesRes] = await Promise.all([
        api.get('/admin/analytics/kpis'),
        api.get('/admin/analytics/funnel'),
        api.get(`/admin/analytics/sales?period=${period}`),
      ]);
      setKpis(kpiRes.data.data);
      setFunnel(funnelRes.data.data);
      setSalesData(salesRes.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'daily' ? 'Ngày' : p === 'weekly' ? 'Tuần' : 'Tháng'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Widgets */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Tổng Doanh Thu"
            value={`${formatCurrency(kpis.total_revenue)} VND`}
            icon="currency"
            color="green"
          />
          <KPICard
            title="Hợp Đồng Active"
            value={kpis.active_policies.toString()}
            subtitle={`/ ${kpis.total_policies} tổng`}
            icon="document"
            color="blue"
          />
          <KPICard
            title="Tỉ Lệ Chuyển Đổi"
            value={`${kpis.conversion_rate.toFixed(1)}%`}
            icon="chart"
            color="purple"
          />
          <KPICard
            title="KH Mới Tháng Này"
            value={kpis.new_customers_this_month.toString()}
            icon="users"
            color="orange"
          />
          <KPICard
            title="Tổng Claims"
            value={kpis.total_claims.toString()}
            subtitle={`Tỉ lệ: ${kpis.claims_ratio.toFixed(1)}%`}
            icon="claim"
            color="red"
          />
          <KPICard
            title="Phí BH Trung Bình"
            value={`${formatCurrency(kpis.average_premium)} VND`}
            icon="average"
            color="teal"
          />
        </div>
      )}

      {/* Conversion Funnel */}
      {funnel && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Phễu Chuyển Đổi</h2>
          <div className="space-y-3">
            <FunnelStep label="Khách truy cập" value={funnel.visitors} max={funnel.visitors} color="bg-gray-300" />
            <FunnelStep label="Bắt đầu báo giá" value={funnel.quote_started} max={funnel.visitors} rate={funnel.rates.quote_start_rate} color="bg-blue-300" />
            <FunnelStep label="Hoàn thành báo giá" value={funnel.quote_completed} max={funnel.visitors} rate={funnel.rates.quote_completion_rate} color="bg-blue-400" />
            <FunnelStep label="Bắt đầu mua" value={funnel.purchase_started} max={funnel.visitors} rate={funnel.rates.purchase_rate} color="bg-green-400" />
            <FunnelStep label="Thanh toán thành công" value={funnel.payment_completed} max={funnel.visitors} rate={funnel.rates.payment_rate} color="bg-green-500" />
            <FunnelStep label="Phát hành HĐ" value={funnel.policy_issued} max={funnel.visitors} rate={funnel.rates.overall_conversion} color="bg-green-600" />
          </div>
        </div>
      )}

      {/* Sales Report Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Báo Cáo Bán Hàng</h2>
          <button
            onClick={() => window.open(`/api/v1/admin/analytics/export?report_type=sales&period=${period}`, '_blank')}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Xuất CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Kỳ</th>
                <th className="px-4 py-3 text-right">Số HĐ</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">Phí TB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesData.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium">{row.period}</td>
                  <td className="px-4 py-3 text-right">{row.policies_issued}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.total_revenue)} VND</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.avg_premium)} VND</td>
                </tr>
              ))}
              {salesData.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const KPICard: React.FC<{ title: string; value: string; subtitle?: string; icon: string; color: string }> = ({ title, value, subtitle, color }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    teal: 'bg-teal-50 border-teal-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs text-gray-600 font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

const FunnelStep: React.FC<{ label: string; value: number; max: number; rate?: number; color: string }> = ({ label, value, max, rate, color }) => {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 text-sm text-gray-600">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
        <div className={`${color} h-6 rounded-full transition-all`} style={{ width: `${width}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {value.toLocaleString()}
        </span>
      </div>
      {rate !== undefined && (
        <div className="w-16 text-right text-sm font-medium text-gray-700">{rate.toFixed(1)}%</div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
