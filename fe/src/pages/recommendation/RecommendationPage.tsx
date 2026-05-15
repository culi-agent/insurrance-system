import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface Recommendation {
  product_id: string;
  product_name: string;
  insurance_type: string;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggested_coverage: number;
  estimated_premium: number;
}

interface CoverageGap {
  category: string;
  current: number;
  recommended: number;
  gap: number;
  gap_percentage: number;
  priority: string;
  suggestion: string;
}

interface CoverageGapAnalysis {
  current_coverage: Record<string, number>;
  recommended_coverage: Record<string, number>;
  gaps: CoverageGap[];
  overall_score: number;
}

const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<CoverageGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'gaps'>('recommendations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recRes, gapRes] = await Promise.all([
        api.get('/recommendations'),
        api.get('/recommendations/coverage-gaps'),
      ]);
      setRecommendations(recRes.data.data);
      setGapAnalysis(gapRes.data.data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      life: 'Nhân thọ', health: 'Sức khỏe', motor: 'Xe cơ giới', property: 'Tài sản',
    };
    return labels[category] || category;
  };

  const getQuoteUrl = (type: string) => {
    const urls: Record<string, string> = {
      life: '/bao-hiem-nhan-tho', health: '/bao-hiem-suc-khoe',
      motor: '/bao-hiem-xe', travel: '/bao-hiem-du-lich',
      property: '/bao-hiem-nha', personal_accident: '/bao-hiem-tai-nan',
    };
    return urls[type] || '/categories';
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
        <h1 className="text-2xl font-bold text-gray-900">Gợi Ý Bảo Hiểm Cho Bạn</h1>
        <p className="text-gray-600 mt-1">Phân tích và đề xuất dựa trên hồ sơ cá nhân</p>
      </div>

      {/* Coverage Score */}
      {gapAnalysis && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mức độ bảo vệ hiện tại</p>
              <p className={`text-4xl font-bold ${getScoreColor(gapAnalysis.overall_score)}`}>
                {gapAnalysis.overall_score}%
              </p>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={gapAnalysis.overall_score >= 70 ? '#10b981' : gapAnalysis.overall_score >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeDasharray={`${gapAnalysis.overall_score * 2.51} 251`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {gapAnalysis.overall_score < 70 && (
            <p className="text-sm text-orange-600 mt-2">
              Bạn cần bổ sung thêm bảo hiểm để đảm bảo tài chính an toàn.
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'recommendations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Đề xuất sản phẩm ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'gaps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Phân tích thiếu hụt ({gapAnalysis?.gaps.length || 0})
        </button>
      </div>

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{rec.product_name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority === 'high' ? 'Ưu tiên cao' : rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>STBH đề xuất: {(rec.suggested_coverage / 1000000).toFixed(0)}M VND</span>
                  <span>Phí ước tính: ~{(rec.estimated_premium / 1000000).toFixed(1)}M VND/năm</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Phù hợp</span>
                  <span className={`text-lg font-bold ${getScoreColor(rec.score)}`}>{rec.score}%</span>
                </div>
                <button
                  onClick={() => navigate(getQuoteUrl(rec.insurance_type))}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Xem báo giá
                </button>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có đề xuất nào. Bạn đã được bảo vệ đầy đủ!
            </div>
          )}
        </div>
      )}

      {/* Coverage Gaps Tab */}
      {activeTab === 'gaps' && gapAnalysis && (
        <div className="space-y-4">
          {gapAnalysis.gaps.map((gap, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow p-5 border-l-4 ${
              gap.priority === 'critical' ? 'border-l-red-500' :
              gap.priority === 'high' ? 'border-l-orange-500' :
              gap.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{getCategoryLabel(gap.category)}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(gap.priority)}`}>
                  Thiếu {gap.gap_percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${100 - gap.gap_percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Hiện có: {(gap.current / 1000000).toFixed(0)}M VND</span>
                <span>Cần: {(gap.recommended / 1000000).toFixed(0)}M VND</span>
              </div>

              <p className="text-sm text-gray-600">{gap.suggestion}</p>

              <button
                onClick={() => navigate(getQuoteUrl(gap.category))}
                className="mt-3 text-sm text-blue-600 hover:underline font-medium"
              >
                Bổ sung ngay →
              </button>
            </div>
          ))}
          {gapAnalysis.gaps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tuyệt vời! Bạn đã được bảo vệ đầy đủ trên mọi khía cạnh.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
