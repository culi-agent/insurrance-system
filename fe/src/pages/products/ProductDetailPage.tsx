import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner className="py-32" size="lg" />;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sản phẩm không tồn tại</h2>
        <p className="text-gray-600 mb-4">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/categories" className="btn-primary inline-block">Xem danh mục</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-primary-600">Danh mục</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/categories/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">
                  {product.category?.name}
                </span>
              </div>
              {product.insurer && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.insurer.name}</p>
                </div>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.short_description}</p>

            {/* Rating */}
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating} ({product.review_count} đánh giá)
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Độ tuổi: {product.min_age || 0} - {product.max_age || 100} tuổi
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi bảo hiểm</h2>
              <div className="space-y-3">
                {Array.isArray(product.benefits) ? (
                  product.benefits.map((b: any, i: number) => (
                    <div key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{typeof b === 'string' ? b : b.name || b.description}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Liên hệ để biết thêm chi tiết quyền lợi.</p>
                )}
              </div>
            </div>
          )}

          {/* Exclusions */}
          {product.exclusions && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Điều khoản loại trừ</h2>
              <div className="space-y-3">
                {Array.isArray(product.exclusions) ? (
                  product.exclusions.map((e: any, i: number) => (
                    <div key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{typeof e === 'string' ? e : e.name || e.description}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Xem chi tiết trong hợp đồng bảo hiểm.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Pricing */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin phí</h3>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Phí bảo hiểm từ</p>
              <p className="text-3xl font-bold text-primary-600">
                {product.min_premium ? `${product.min_premium.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
              </p>
              {product.max_premium && (
                <p className="text-sm text-gray-500 mt-1">
                  Đến {product.max_premium.toLocaleString('vi-VN')}đ/năm
                </p>
              )}
            </div>

            <Link
              to={`/quotation?product=${product.id}`}
              className="btn-primary w-full text-center block mb-3"
            >
              Nhận báo giá
            </Link>

            <button className="btn-secondary w-full">
              Tư vấn miễn phí
            </button>

            {/* Quick info */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-gray-600">Bảo hiểm chính hãng</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Cấp đơn trong 5 phút</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600">Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Documents */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tài liệu</h4>
              {product.terms_url && (
                <a href={product.terms_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary-600 hover:text-primary-700 mb-2">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Điều khoản & Điều kiện
                </a>
              )}
              {product.brochure_url && (
                <a href={product.brochure_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Brochure sản phẩm
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
