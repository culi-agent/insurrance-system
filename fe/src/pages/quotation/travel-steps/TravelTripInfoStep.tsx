import React from 'react';
import type { TravelFormData } from '../TravelQuotePage';

interface Props {
  formData: Partial<TravelFormData>;
  updateFormData: (data: Partial<TravelFormData>) => void;
  onNext: () => void;
}

const DESTINATIONS = [
  { value: 'domestic', label: 'Nội địa (Việt Nam)', icon: '🇻🇳' },
  { value: 'asia', label: 'Châu Á', icon: '🌏' },
  { value: 'worldwide', label: 'Toàn cầu', icon: '🌍' },
];

const PURPOSES = [
  { value: 'leisure', label: 'Du lịch' },
  { value: 'business', label: 'Công tác' },
  { value: 'study', label: 'Du học' },
  { value: 'work', label: 'Lao động' },
];

const TravelTripInfoStep: React.FC<Props> = ({ formData, updateFormData, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departure_date || !formData.return_date) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông Tin Chuyến Đi</h2>

      {/* Trip Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Loại chuyến đi</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData({ trip_type: 'single' })}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formData.trip_type === 'single' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium">Một chuyến</p>
            <p className="text-sm text-gray-500">Bảo hiểm cho 1 chuyến đi cụ thể</p>
          </button>
          <button
            type="button"
            onClick={() => updateFormData({ trip_type: 'annual' })}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formData.trip_type === 'annual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium">Cả năm</p>
            <p className="text-sm text-gray-500">Nhiều chuyến trong 12 tháng</p>
          </button>
        </div>
      </div>

      {/* Destination */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực đến</label>
        <div className="grid grid-cols-3 gap-3">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.value}
              type="button"
              onClick={() => updateFormData({ destination_type: dest.value })}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.destination_type === dest.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{dest.icon}</span>
              <p className="font-medium text-sm mt-1">{dest.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Destination Country */}
      {formData.destination_type !== 'domestic' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia đến</label>
          <input
            type="text"
            value={formData.destination_country || ''}
            onChange={(e) => updateFormData({ destination_country: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhật Bản, Hàn Quốc, Thái Lan..."
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày khởi hành <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.departure_date || ''}
            onChange={(e) => updateFormData({ departure_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày về <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.return_date || ''}
            onChange={(e) => updateFormData({ return_date: e.target.value })}
            min={formData.departure_date || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Mục đích chuyến đi</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PURPOSES.map((purpose) => (
            <button
              key={purpose.value}
              type="button"
              onClick={() => updateFormData({ trip_purpose: purpose.value })}
              className={`py-2 px-4 border-2 rounded-lg text-sm font-medium transition-colors ${
                formData.trip_purpose === purpose.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {purpose.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên liên hệ</label>
          <input
            type="text"
            value={formData.contact_name || ''}
            onChange={(e) => updateFormData({ contact_name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
          <input
            type="tel"
            value={formData.contact_phone || ''}
            onChange={(e) => updateFormData({ contact_phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => updateFormData({ contact_email: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Tiếp tục
        </button>
      </div>
    </form>
  );
};

export default TravelTripInfoStep;
