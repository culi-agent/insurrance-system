import React, { useState } from 'react';

interface FilterOptions {
  category?: string;
  insurer?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
}

interface Props {
  onFilterChange: (filters: FilterOptions) => void;
  insurers?: Array<{ id: string; name: string }>;
  showCategoryFilter?: boolean;
}

const PRICE_RANGES = [
  { label: 'Tất cả', min: undefined, max: undefined },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K - 1 triệu', min: 500000, max: 1000000 },
  { label: '1 - 3 triệu', min: 1000000, max: 3000000 },
  { label: '3 - 10 triệu', min: 3000000, max: 10000000 },
  { label: 'Trên 10 triệu', min: 10000000, max: undefined },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'newest', label: 'Mới nhất' },
];

const ProductFilter: React.FC<Props> = ({ onFilterChange, insurers = [] }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
      {/* Top bar - Sort & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Bộ lọc
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
          {Object.values(filters).filter(Boolean).length > 0 && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sắp xếp:</span>
          <select
            value={filters.sort_by || 'popular'}
            onChange={(e) => updateFilter('sort_by', e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
            <div className="space-y-1">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    updateFilter('min_price', range.min);
                    updateFilter('max_price', range.max);
                  }}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    filters.min_price === range.min && filters.max_price === range.max
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Insurer */}
          {insurers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà bảo hiểm</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateFilter('insurer', undefined)}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                    !filters.insurer ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  Tất cả
                </button>
                {insurers.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => updateFilter('insurer', ins.id)}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                      filters.insurer === ins.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {ins.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đặc điểm</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-gray-600">Bồi thường nhanh</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-gray-600">Hỗ trợ 24/7</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-gray-600">Không khấu trừ</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-gray-600">Có ưu đãi</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
