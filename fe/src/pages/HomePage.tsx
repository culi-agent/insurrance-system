import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  'motor-insurance': { icon: '🚗', color: 'bg-blue-50 text-blue-700' },
  'health-insurance': { icon: '🏥', color: 'bg-green-50 text-green-700' },
  'life-insurance': { icon: '❤️', color: 'bg-red-50 text-red-700' },
  'travel-insurance': { icon: '✈️', color: 'bg-purple-50 text-purple-700' },
  'property-insurance': { icon: '🏠', color: 'bg-orange-50 text-orange-700' },
  'liability-insurance': { icon: '⚖️', color: 'bg-indigo-50 text-indigo-700' },
  'business-insurance': { icon: '🏢', color: 'bg-teal-50 text-teal-700' },
};

export default function HomePage() {
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data: featuredProducts, isLoading: prodLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeaturedProducts(6),
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bảo hiểm thông minh cho cuộc sống hiện đại
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              So sánh và mua bảo hiểm trực tuyến từ các nhà bảo hiểm hàng đầu Việt Nam.
              Nhanh chóng, minh bạch, tiết kiệm đến 30%.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/categories" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Khám phá sản phẩm
              </Link>
              <Link to="/categories/motor-insurance" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Báo giá ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">10+</div>
              <div className="text-gray-600 text-sm mt-1">Nhà bảo hiểm</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-gray-600 text-sm mt-1">Sản phẩm</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">5 phút</div>
              <div className="text-gray-600 text-sm mt-1">Mua bảo hiểm</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600 text-sm mt-1">Hỗ trợ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Danh mục bảo hiểm</h2>
            <p className="mt-3 text-gray-600">Đa dạng sản phẩm bảo hiểm cho mọi nhu cầu</p>
          </div>

          {catLoading ? (
            <LoadingSpinner className="py-8" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((cat) => {
                const meta = CATEGORY_ICONS[cat.slug] || { icon: '🛡️', color: 'bg-gray-50 text-gray-700' };
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="card text-center hover:border-primary-200 group"
                  >
                    <div className={`w-14 h-14 ${meta.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform`}>
                      {meta.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cat.description || 'Xem chi tiết'}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
              <p className="mt-2 text-gray-600">Được nhiều khách hàng lựa chọn</p>
            </div>
            <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>

          {prodLoading ? (
            <LoadingSpinner className="py-8" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts?.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="card group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                      {product.category?.name || 'Bảo hiểm'}
                    </span>
                    {product.insurer?.logo_url && (
                      <img src={product.insurer.logo_url} alt={product.insurer.name} className="h-6" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500">Từ </span>
                      <span className="text-lg font-bold text-primary-600">
                        {product.min_premium?.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-sm text-gray-500">/năm</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">{product.rating || '4.5'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu bảo vệ ngay hôm nay</h2>
          <p className="text-gray-400 text-lg mb-8">
            Chỉ mất 5 phút để nhận báo giá. So sánh và chọn phương án tốt nhất.
          </p>
          <Link to="/categories" className="btn-primary text-lg px-8 py-3">
            Nhận báo giá miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
}
