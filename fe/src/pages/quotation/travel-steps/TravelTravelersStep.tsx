import React, { useState } from 'react';
import type { TravelFormData } from '../TravelQuotePage';

interface Props {
  formData: Partial<TravelFormData>;
  updateFormData: (data: Partial<TravelFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface TravelerForm {
  full_name: string;
  date_of_birth: string;
  id_number: string;
  is_primary: boolean;
}

const TravelTravelersStep: React.FC<Props> = ({ formData, updateFormData, onNext, onPrev }) => {
  const [newTraveler, setNewTraveler] = useState<TravelerForm>({
    full_name: '',
    date_of_birth: '',
    id_number: '',
    is_primary: (formData.travelers || []).length === 0,
  });

  const travelers = formData.travelers || [];

  const addTraveler = () => {
    if (!newTraveler.full_name || !newTraveler.date_of_birth) return;
    const updated = [...travelers, { ...newTraveler, is_primary: travelers.length === 0 }];
    updateFormData({ travelers: updated });
    setNewTraveler({ full_name: '', date_of_birth: '', id_number: '', is_primary: false });
  };

  const removeTraveler = (index: number) => {
    const updated = travelers.filter((_, i) => i !== index);
    updateFormData({ travelers: updated });
  };

  const handleContinue = () => {
    if (travelers.length === 0) return;
    onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Người Đi Du Lịch</h2>
      <p className="text-gray-600 mb-6">Thêm thông tin những người sẽ được bảo hiểm</p>

      {/* Traveler List */}
      {travelers.length > 0 && (
        <div className="mb-6 space-y-3">
          {travelers.map((t, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {t.full_name}
                    {t.is_primary && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Chính</span>}
                  </p>
                  <p className="text-sm text-gray-500">Sinh: {t.date_of_birth}</p>
                </div>
              </div>
              <button onClick={() => removeTraveler(index)} className="text-red-500 hover:text-red-700 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Traveler Form */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Thêm người đi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={newTraveler.full_name}
              onChange={(e) => setNewTraveler({ ...newTraveler, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày sinh *</label>
            <input
              type="date"
              value={newTraveler.date_of_birth}
              onChange={(e) => setNewTraveler({ ...newTraveler, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số CCCD/Hộ chiếu</label>
            <input
              type="text"
              value={newTraveler.id_number}
              onChange={(e) => setNewTraveler({ ...newTraveler, id_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="B1234567"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addTraveler}
          disabled={!newTraveler.full_name || !newTraveler.date_of_birth}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Thêm
        </button>
      </div>

      {travelers.length === 0 && (
        <p className="text-sm text-amber-600 mb-4">Vui lòng thêm ít nhất 1 người đi du lịch</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Quay lại
        </button>
        <button
          onClick={handleContinue}
          disabled={travelers.length === 0}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Tiếp tục ({travelers.length} người)
        </button>
      </div>
    </div>
  );
};

export default TravelTravelersStep;
