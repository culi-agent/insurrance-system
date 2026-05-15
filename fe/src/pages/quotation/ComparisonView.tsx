import React, { useState } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import type { InsurerQuote } from '@/types/quotation';

const ComparisonView: React.FC = () => {
  const { comparisonQuotes, formData, setStep, resetForm } = useQuotationStore();
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (!comparisonQuotes || comparisonQuotes.quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không có báo giá nào từ nhà bảo hiểm.</p>
        <button
          onClick={() => setStep('vehicle')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { quotes, vehicle } = comparisonQuotes;
  const cheapest = quotes[0]?.premium.total || 0;

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            So sánh báo giá ({quotes.length} nhà bảo hiểm)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {vehicle.brand} {vehicle.model} ({vehicle.year}) - Giá trị:{' '}
            {formatCurrency(vehicle.value)}đ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              viewMode === 'cards'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Thẻ
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Bảng
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((quote, index) => (
            <QuoteCard
              key={quote.insurer.code}
              quote={quote}
              index={index}
              cheapest={cheapest}
              isSelected={selectedQuote === quote.insurer.code}
              onSelect={() => setSelectedQuote(quote.insurer.code)}
              formatCurrency={formatCurrency}
              renderStars={renderStars}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 text-sm font-medium text-gray-600">
                  Nhà bảo hiểm
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Sản phẩm</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Phí cơ bản</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Giảm giá</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">
                  Tổng phí
                </th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">
                  Đánh giá
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote, index) => (
                <tr
                  key={quote.insurer.code}
                  className={`border-t ${
                    selectedQuote === quote.insurer.code ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{quote.insurer.name}</span>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Rẻ nhất
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{quote.product_name}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(quote.premium.base)}đ</td>
                  <td className="p-3 text-sm text-right text-green-600">
                    -{formatCurrency(quote.premium.discount)}đ
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-bold text-blue-600">
                      {formatCurrency(quote.premium.total)}đ
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    {renderStars(quote.insurer.rating)}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedQuote(quote.insurer.code)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Chọn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Quote Detail */}
      {selectedQuote && (
        <SelectedQuoteDetail
          quote={quotes.find((q) => q.insurer.code === selectedQuote)!}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={() => setStep('owner')}
          className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← Quay lại
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100"
          >
            Báo giá mới
          </button>
          {selectedQuote && (
            <button
              type="button"
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Mua ngay →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component: Quote Card
interface QuoteCardProps {
  quote: InsurerQuote;
  index: number;
  cheapest: number;
  isSelected: boolean;
  onSelect: () => void;
  formatCurrency: (v: number) => string;
  renderStars: (rating: number) => React.ReactNode;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  index,
  cheapest,
  isSelected,
  onSelect,
  formatCurrency,
  renderStars,
}) => {
  const savings = quote.premium.total - cheapest;

  return (
    <div
      onClick={onSelect}
      className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Badge */}
      {index === 0 && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Giá tốt nhất
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{quote.insurer.name}</h3>
          <p className="text-sm text-gray-500">{quote.product_name}</p>
          <div className="flex items-center gap-1 mt-1">
            {renderStars(quote.insurer.rating)}
            <span className="text-xs text-gray-500 ml-1">{quote.insurer.rating}</span>
          </div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(quote.premium.total)}đ
        </div>
        {savings > 0 && (
          <p className="text-xs text-gray-500">+{formatCurrency(savings)}đ so với giá thấp nhất</p>
        )}
        {quote.premium.discount > 0 && (
          <p className="text-xs text-green-600">
            Tiết kiệm {formatCurrency(quote.premium.discount)}đ
          </p>
        )}
      </div>

      {/* Coverage highlights */}
      <div className="space-y-1.5 mb-4">
        {quote.coverage_details.slice(0, 3).map((cd, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{cd.name}</span>
            <span className="text-gray-400 text-xs ml-auto">
              {formatCurrency(cd.sum_insured)}đ
            </span>
          </div>
        ))}
      </div>

      {/* Features */}
      {quote.insurer.features.length > 0 && (
        <div className="border-t pt-3">
          <div className="flex flex-wrap gap-1">
            {quote.insurer.features.map((f, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Selected Quote Detail
interface SelectedQuoteDetailProps {
  quote: InsurerQuote;
  formatCurrency: (v: number) => string;
}

const SelectedQuoteDetail: React.FC<SelectedQuoteDetailProps> = ({ quote, formatCurrency }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chi tiết báo giá - {quote.insurer.name}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Premium Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Cấu trúc phí</h4>
          <div className="space-y-2">
            {quote.premium_breakdown.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.item}</span>
                <span
                  className={`font-medium ${
                    item.amount < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {item.amount < 0 ? '-' : ''}
                  {formatCurrency(Math.abs(item.amount))}đ
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(quote.premium.total)}đ
              </span>
            </div>
          </div>
        </div>

        {/* Coverage Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quyền lợi bảo hiểm</h4>
          <div className="space-y-2">
            {quote.coverage_details.map((cd, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-700">{cd.name}</span>
                  {cd.description && (
                    <p className="text-xs text-gray-500">{cd.description}</p>
                  )}
                </div>
                <span className="font-medium text-gray-900 whitespace-nowrap ml-2">
                  {formatCurrency(cd.sum_insured)}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Valid Until */}
      <div className="mt-4 pt-3 border-t border-blue-200 text-sm text-gray-600">
        Báo giá có hiệu lực đến:{' '}
        <span className="font-medium">
          {new Date(quote.valid_until).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

export default ComparisonView;
