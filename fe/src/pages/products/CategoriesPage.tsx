import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CATEGORY_META: Record<string, { icon: string; color: string; gradient: string; description: string }> = {
  'motor-insurance': {
    icon: '🚗',
    color: 'bg-blue-50 border-blue-200',
    gradient: 'from-blue-500 to-blue-700',
    description: 'Bảo vệ toàn diện cho xe ô tô và xe máy, bồi thường thiệt hại vật chất và trách nhiệm dân sự.',
  },
  'health-insurance': {
    icon: '🏥',
    color: 'bg-green-50 border-green-200',
    gradient: 'from-green-500 to-green-700',
    description: 'Chi trả viện phí, phẫu thuật và chăm sóc sức khỏe toàn diện cho cá nhân và gia đình.',
  },
  'life-insurance': {
    icon: '❤️',
    color: 'bg-red-50 border-red-200',
    gradient: 'from-red-500 to-red-700',
    description: 'Bảo vệ tài chính cho gia đình bạn, tích lũy và đầu tư cho tương lai.',
  },
  'travel-insurance': {
    icon: '✈️',
    color: 'bg-purple-50 border-purple-200',
    gradient: 'from-purple-500 to-purple-700',
    description: 'An tâm du lịch trong và ngoài nước, bảo vệ trước rủi ro hành trình.',
  },
  'property-insurance': {
    icon: '🏠',
    color: 'bg-orange-50 border-orange-200',
    gradient: 'from-orange-500 to-orange-700',
    description: 'Bảo vệ nhà cửa và tài sản trước thiên tai, hỏa hoạn và các rủi ro khác.',
  },
  'liability-insurance': {
    icon: '⚖️',
    color: 'bg-indigo-50 border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-700',
    description: 'Bảo vệ trách nhiệm pháp lý, bồi thường thiệt hại cho bên thứ ba.',
  },
  'business-insurance': {
    icon: '🏢',
    color: 'bg-teal-50 border-teal-200',
    gradient: 'from-teal-500 to-teal-700',
    description: 'Giải pháp bảo hiểm doanh nghiệp toàn diện, bảo vệ hoạt động kinh doanh.',
  },
};

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Danh mục bảo hiểm</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá đa dạng sản phẩm bảo hiểm phù hợp với mọi nhu cầu của bạn và gia đình.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-16" size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((cat) => {
            const meta = CATEGORY_META[cat.slug] || {
              icon: '🛡️',
              color: 'bg-gray-50 border-gray-200',
              gradient: 'from-gray-500 to-gray-700',
              description: cat.description || 'Xem sản phẩm bảo hiểm',
            };
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className={`rounded-xl border p-8 ${meta.color} hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{meta.icon}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{meta.description}</p>
                <span className="inline-flex items-center text-primary-600 font-medium text-sm">
                  Xem sản phẩm
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
