import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';

interface ComparedProduct {
  id: string;
  name: string;
  insurer: string;
  premium: number;
  coverage_limit: number;
  features: string[];
  rating: number;
  pros: string[];
  cons: string[];
}

const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ComparedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{ product_id: string; reason: string } | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Fetch comparison if product_ids in URL
  React.useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      fetchComparison(ids.split(','));
    }
  }, [searchParams]);

  const fetchComparison = async (productIds: string[]) => {
    try {
      setLoading(true);
      const res = await api.post('/products/compare', { product_ids: productIds });
      setProducts(res.data.data.products || []);
      setRecommendation(res.data.data.recommendation || null);
    } catch { }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">So Sánh Sản Phẩm</h1>
          <p className="text-gray-600 mt-2">So sánh chi tiết giữa các sản phẩm bảo hiểm</p>
        </div>

        {products.length > 0 ? (
          <>
            {/* Recommendation Banner */}
            {recommendation && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-medium text-green-800">Gợi ý cho bạn</p>
                  <p className="text-sm text-green-700">{recommendation.reason}</p>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-40">Tiêu chí</th>
                    {products.map((p) => (
                      <th key={p.id} className="px-6 py-4 text-center min-w-[200px]">
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.insurer}</p>
                        {recommendation?.product_id === p.id && (
                          <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gợi ý</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Phí hàng năm</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center font-semibold text-blue-600">{formatCurrency(p.premium)}</td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Hạn mức bảo hiểm</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">{formatCurrency(p.coverage_limit)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Đánh giá</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        <span className="text-amber-500">{'★'.repeat(Math.round(p.rating))}</span> {p.rating}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Ưu điểm</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4">
                        <ul className="space-y-1">
                          {p.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-green-700 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Nhược điểm</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4">
                        <ul className="space-y-1">
                          {p.cons.map((con, i) => (
                            <li key={i} className="text-xs text-red-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4"></td>
                    {products.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-center">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Chọn mua</button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">Chọn 2-4 sản phẩm để so sánh</p>
            <p className="text-gray-400 text-sm">Thêm sản phẩm vào danh sách so sánh từ trang danh mục</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
