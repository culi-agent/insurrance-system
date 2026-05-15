import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import type { Product } from '@/types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, searchPage: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        const response = await productService.searchProducts(searchQuery, searchPage);
        setResults(response.data);
        setTotal(response.total);
        setPage(searchPage);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Search on initial load if query param exists
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  const handlePageChange = (newPage: number) => {
    performSearch(query, newPage);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm kiếm sản phẩm bảo hiểm
          </h1>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm bảo hiểm xe, sức khỏe, du lịch..."
                className="w-full px-5 py-4 pr-14 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Suggestions */}
        {!hasSearched && (
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-3">Gợi ý tìm kiếm:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Bảo hiểm xe ô tô',
                'Bảo hiểm sức khỏe',
                'Bảo hiểm du lịch',
                'Bảo hiểm nhân thọ',
                'Bảo hiểm xe máy',
                'TNDS bắt buộc',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setSearchParams({ q: suggestion });
                    performSearch(suggestion);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {total > 0
                  ? `Tìm thấy ${total} sản phẩm cho "${query}"`
                  : `Không tìm thấy kết quả cho "${query}"`}
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductSearchCard
                    key={product.id}
                    product={product}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                <p className="text-gray-400 text-sm mt-2">
                  Thử tìm kiếm với từ khóa khác hoặc duyệt danh mục
                </p>
                <Link
                  to="/categories"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xem danh mục
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-2 border rounded-lg ${
                      p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Product Card for Search Results
const ProductSearchCard: React.FC<{
  product: Product;
  formatCurrency: (v: number) => string;
}> = ({ product, formatCurrency }) => {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* Insurer */}
      {product.insurer && (
        <div className="flex items-center gap-2 mb-3">
          {product.insurer.logo_url && (
            <img
              src={product.insurer.logo_url}
              alt={product.insurer.name}
              className="w-6 h-6 rounded"
            />
          )}
          <span className="text-xs text-gray-500">{product.insurer.name}</span>
        </div>
      )}

      {/* Product Name */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
      {product.short_description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.short_description}</p>
      )}

      {/* Category Badge */}
      {product.category && (
        <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mb-3">
          {product.category.name}
        </span>
      )}

      {/* Price & Rating */}
      <div className="flex items-end justify-between mt-auto pt-3 border-t">
        <div>
          {product.min_premium && (
            <span className="text-sm text-gray-500">
              Từ{' '}
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(product.min_premium)}đ
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.review_count})</span>
        </div>
      </div>
    </Link>
  );
};

export default SearchPage;
