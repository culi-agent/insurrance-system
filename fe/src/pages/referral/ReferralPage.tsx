import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface ReferralStats {
  referral_code: string | null;
  referral_link: string | null;
  stats: {
    total_referrals: number;
    registered: number;
    completed: number;
    rewarded: number;
    total_earned: number;
  };
  program: {
    referrer_reward: number;
    referee_reward: number;
    reward_type: string;
    max_referrals: number;
  };
}

interface ReferralItem {
  id: string;
  referral_code: string;
  referee_name: string;
  referee_email: string | null;
  status: string;
  reward_amount: number;
  reward_status: string;
  registered_at: string | null;
  first_purchase_at: string | null;
  created_at: string;
}

const ReferralPage: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/referrals/stats'),
        api.get('/referrals/list'),
      ]);
      setStats(statsRes.data.data);
      setReferrals(listRes.data.data.data || []);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      const res = await api.post('/referrals/generate');
      setStats(prev => prev ? {
        ...prev,
        referral_code: res.data.data.referral_code,
        referral_link: res.data.data.referral_link,
      } : null);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCopyLink = () => {
    if (stats?.referral_link) {
      navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { class: string; label: string }> = {
      pending: { class: 'bg-gray-100 text-gray-800', label: 'Chờ đăng ký' },
      registered: { class: 'bg-blue-100 text-blue-800', label: 'Đã đăng ký' },
      completed: { class: 'bg-green-100 text-green-800', label: 'Đã mua BH' },
      rewarded: { class: 'bg-purple-100 text-purple-800', label: 'Đã nhận thưởng' },
    };
    const item = map[status] || { class: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.class}`}>{item.label}</span>;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-60 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giới Thiệu Bạn Bè</h1>
        <p className="text-gray-600 mt-1">Mời bạn bè mua bảo hiểm và nhận thưởng</p>
      </div>

      {/* Program info */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white mb-6">
          <h2 className="text-lg font-bold mb-2">Chương trình giới thiệu</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-200">Bạn nhận được</p>
              <p className="text-xl font-bold">{stats.program.referrer_reward.toLocaleString('vi-VN')} VND</p>
            </div>
            <div>
              <p className="text-blue-200">Bạn bè nhận được</p>
              <p className="text-xl font-bold">{stats.program.referee_reward.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>

          {/* Referral link */}
          <div className="mt-4">
            {stats.referral_link ? (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={stats.referral_link}
                  className="flex-1 px-3 py-2 bg-white/20 rounded text-white text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-white text-blue-700 font-medium rounded hover:bg-blue-50 text-sm"
                >
                  {copied ? 'Copied!' : 'Sao chép'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                className="px-4 py-2 bg-white text-blue-700 font-medium rounded hover:bg-blue-50"
              >
                Tạo link giới thiệu
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.stats.total_referrals}</p>
            <p className="text-xs text-gray-500">Tổng giới thiệu</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.stats.completed}</p>
            <p className="text-xs text-gray-500">Đã mua BH</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.stats.rewarded}</p>
            <p className="text-xs text-gray-500">Đã nhận thưởng</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.stats.total_earned.toLocaleString('vi-VN')}</p>
            <p className="text-xs text-gray-500">Tổng thu nhập (VND)</p>
          </div>
        </div>
      )}

      {/* Referrals list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold">Danh sách giới thiệu</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có giới thiệu nào. Chia sẻ link để bắt đầu!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Người được giới thiệu</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thưởng</th>
                  <th className="px-4 py-3 text-left">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referrals.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.referee_name}</p>
                      {r.referee_email && <p className="text-xs text-gray-500">{r.referee_email}</p>}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {r.reward_amount.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;
