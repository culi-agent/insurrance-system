import React from 'react';
import type { HealthFormData } from '../HealthQuotePage';

interface Props {
  formData: Partial<HealthFormData>;
  updateFormData: (data: Partial<HealthFormData>) => void;
  onNext: () => void;
}

const HealthPersonalStep: React.FC<Props> = ({ formData, updateFormData, onNext }) => {
  const applicant = formData.applicant || { full_name: '', date_of_birth: '', gender: 'male', occupation: '', id_number: '', phone: '', email: '' };

  const updateApplicant = (field: string, value: string) => {
    updateFormData({ applicant: { ...applicant, [field]: value } } as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.full_name || !applicant.date_of_birth || !applicant.occupation) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông Tin Cá Nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
          <input type="text" required value={applicant.full_name} onChange={(e) => updateApplicant('full_name', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
          <input type="date" required value={applicant.date_of_birth} onChange={(e) => updateApplicant('date_of_birth', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
          <select value={applicant.gender} onChange={(e) => updateApplicant('gender', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp *</label>
          <input type="text" required value={applicant.occupation} onChange={(e) => updateApplicant('occupation', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nhân viên văn phòng" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD</label>
          <input type="text" value={applicant.id_number} onChange={(e) => updateApplicant('id_number', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="079123456789" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
          <input type="tel" value={applicant.phone} onChange={(e) => updateApplicant('phone', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0901234567" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={applicant.email} onChange={(e) => updateApplicant('email', e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Tiếp tục</button>
      </div>
    </form>
  );
};

export default HealthPersonalStep;
