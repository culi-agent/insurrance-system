import React, { useState } from 'react';
import type { HealthFormData } from '../HealthQuotePage';

interface Props {
  formData: Partial<HealthFormData>;
  updateFormData: (data: Partial<HealthFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const HealthFamilyStep: React.FC<Props> = ({ formData, updateFormData, onNext, onPrev }) => {
  const isFamily = formData.is_family_plan || false;
  const members = formData.family_members || [];
  const [newMember, setNewMember] = useState({ full_name: '', date_of_birth: '', gender: 'male', relationship: 'spouse' });

  const addMember = () => {
    if (!newMember.full_name || !newMember.date_of_birth) return;
    updateFormData({ family_members: [...members, newMember] });
    setNewMember({ full_name: '', date_of_birth: '', gender: 'male', relationship: 'child' });
  };

  const removeMember = (index: number) => {
    updateFormData({ family_members: members.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Gói Gia Đình</h2>
      <p className="text-gray-600 mb-6">Thêm thành viên gia đình để hưởng ưu đãi nhóm (giảm đến 10%)</p>

      {/* Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isFamily} onChange={(e) => updateFormData({ is_family_plan: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
          <span className="font-medium text-gray-900">Mua cho cả gia đình</span>
          {isFamily && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Giảm đến 10%</span>}
        </label>
      </div>

      {isFamily && (
        <>
          {/* Member List */}
          {members.length > 0 && (
            <div className="space-y-3 mb-6">
              {members.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium">{m.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {m.relationship === 'spouse' ? 'Vợ/Chồng' : m.relationship === 'child' ? 'Con' : 'Cha/Mẹ'}
                      {' - '}{m.gender === 'male' ? 'Nam' : 'Nữ'} - Sinh: {m.date_of_birth}
                    </p>
                  </div>
                  <button onClick={() => removeMember(i)} className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Form */}
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Thêm thành viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Họ và tên" value={newMember.full_name}
                onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="date" value={newMember.date_of_birth}
                onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <select value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              <select value={newMember.relationship} onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="spouse">Vợ/Chồng</option>
                <option value="child">Con</option>
                <option value="parent">Cha/Mẹ</option>
              </select>
            </div>
            <button onClick={addMember} disabled={!newMember.full_name || !newMember.date_of_birth}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              + Thêm
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại</button>
        <button onClick={onNext} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
          Tiếp tục ({1 + members.length} người)
        </button>
      </div>
    </div>
  );
};

export default HealthFamilyStep;
