import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { HealthFormData } from '../HealthQuotePage';

interface Props {
  formData: HealthFormData;
  onPrev: () => void;
}

interface InsurerQuote {
  insurer: { code: string; name: string; rating: number; features: string[] };
  product_name: string;
  premium: { base: number; discount: number; tax: number; total: number };
  coverage_details: Array<{ name: string; coverage_amount: number; description: string }>;
  valid_until: string;
}

const HealthComparisonView: React.FC<Props> = ({ formData, onPrev }) => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<InsurerQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const response = await api.post('/quotations/health/compare', formData);
        setQuotes(response.data.data.quotes || []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Không thể tải báo giá');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Đang tìm gói bảo hiểm sức khỏe phù hợp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onPrev} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Thử lại</button>
      </div>
    );
  }

  const membersCount = 1 + (formData.family_members?.length || 0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">So Sánh Gói Bảo Hiểm Sức Khỏe</h2>
      <p className="text-gray-600 mb-6">Tìm thấy {quotes.length} báo giá cho {membersCount} người</p>

      {/* Summary */}
      <div className="bg-green-50 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div><span className="text-gray-500">Gói:</span> <span className="font-medium capitalize">{formData.plan_type}</span></div>
        <div><span className="text-gray-500">Số người:</span> <span className="font-medium">{membersCount}</span></div>
        <div><span className="text-gray-500">Phạm vi:</span> <span className="font-medium capitalize">{formData.coverage_options.geographic_coverage}</span></div>
        <div><span className="text-gray-500">Phòng:</span> <span className="font-medium capitalize">{formData.coverage_options.room_type}</span></div>
      </div>

      {/* Quotes */}
      <div className="space-y-4">
        {quotes.map((quote, index) => (
          <div key={index} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-gray-900">{quote.insurer.name}</h3>
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {quote.insurer.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{quote.product_name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quote.insurer.features.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(quote.premium.total)}</p>
                <p className="text-sm text-gray-500">~{formatCurrency(Math.round(quote.premium.total / membersCount))}/người/năm</p>
                <button onClick={() => navigate('/purchase?insurance_type=health')}
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Chọn mua
                </button>
              </div>
            </div>

            {/* Coverage */}
            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-2">
              {quote.coverage_details.slice(0, 6).map((c, i) => (
                <div key={i} className="text-xs">
                  <span className="text-gray-500">{c.name}:</span>
                  <span className="ml-1 font-medium">{formatCurrency(c.coverage_amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">Không tìm thấy báo giá phù hợp.</div>
      )}

      <div className="flex justify-start pt-6">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại chỉnh sửa</button>
      </div>
    </div>
  );
};

export default HealthComparisonView;
