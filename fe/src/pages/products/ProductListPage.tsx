import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Product } from '@/types';

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.slug}`} className="card group flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">
          {product.category?.name || 'Bảo hiểm'}
        </span>
        <span className="text-xs text-gray-500">{product.insurer?.name}</span>
      </div>

      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 text-lg">
        {product.name}
      </h3>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
        {product.short_description || 'Sản phẩm bảo hiểm chất lượng cao từ nhà bảo hiểm uy tín.'}
      </p>

      {/* Features */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Bảo vệ toàn diện</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Claim nhanh chóng</span>
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Từ </span>
          <span className="text-xl font-bold text-primary-600">
            {product.min_premium ? `${product.min_premium.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          {product.min_premium && <span className="text-sm text-gray-500">/năm</span>}
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">{product.rating || '4.5'}</span>
          <span className="text-xs text-gray-400">({product.review_count || 0})</span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductListPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => productService.getCategoryBySlug(categorySlug!),
    enabled: !!categorySlug,
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-by-category', categorySlug, page],
    queryFn: () => productService.getProductsByCategory(categorySlug!, page),
    enabled: !!categorySlug,
  });

  const totalPages = productData ? Math.ceil(productData.total / productData.per_page) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-primary-600">Danh mục</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category?.name || categorySlug}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category?.name || 'Sản phẩm'}</h1>
        {category?.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
        {productData && (
          <p className="mt-1 text-sm text-gray-500">{productData.total} sản phẩm</p>
        )}
      </div>

      {/* Products grid */}
      {isLoading ? (
        <LoadingSpinner className="py-16" size="lg" />
      ) : productData?.data.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
          <p className="text-gray-600">Danh mục này đang được cập nhật. Vui lòng quay lại sau.</p>
          <Link to="/categories" className="btn-primary inline-block mt-4">
            Xem danh mục khác
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productData?.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-primary-600 text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
