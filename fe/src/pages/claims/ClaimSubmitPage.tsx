import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const CLAIM_TYPES = [
  { value: 'medical', label: 'Chi phí y tế', icon: '🏥' },
  { value: 'accident', label: 'Tai nạn', icon: '🚑' },
  { value: 'vehicle_damage', label: 'Thiệt hại xe', icon: '🚗' },
  { value: 'theft', label: 'Mất cắp', icon: '🔒' },
  { value: 'travel_delay', label: 'Trễ chuyến/Hủy chuyến', icon: '✈️' },
  { value: 'baggage', label: 'Hành lý', icon: '🧳' },
  { value: 'other', label: 'Khác', icon: '📋' },
];

const ClaimSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    policy_id: '',
    claim_type: '',
    incident_date: '',
    incident_description: '',
    claim_amount: '',
    documents: [] as Array<{ name: string; url: string; type: string }>,
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
    // Simulate upload - in production use real upload
    const docs = newFiles.map(f => ({ name: f.name, url: `/uploads/${f.name}`, type: f.type }));
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...docs] }));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        claim_amount: formData.claim_amount ? parseFloat(formData.claim_amount) : undefined,
      };
      await api.post('/claims', payload);
      navigate('/dashboard/claims');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Bồi Thường</h1>
          <p className="text-gray-600 mt-2">Gửi yêu cầu bồi thường bảo hiểm trực tuyến</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          {/* Step 1: Claim Info */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Thông tin sự cố</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã hợp đồng *</label>
                  <input type="text" value={formData.policy_id} onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="POL-MTR-2026-..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại yêu cầu *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CLAIM_TYPES.map(ct => (
                      <button key={ct.value} type="button" onClick={() => setFormData({ ...formData, claim_type: ct.value })}
                        className={`p-3 border-2 rounded-lg text-center text-sm transition-colors ${
                          formData.claim_type === ct.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <span className="text-xl block mb-1">{ct.icon}</span>
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xảy ra sự cố *</label>
                  <input type="date" value={formData.incident_date} onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sự cố *</label>
                  <textarea rows={4} value={formData.incident_description}
                    onChange={(e) => setFormData({ ...formData, incident_description: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Mô tả chi tiết sự cố xảy ra..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền yêu cầu (VND)</label>
                  <input type="number" value={formData.claim_amount} onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="5000000" />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button onClick={() => setStep(2)} disabled={!formData.policy_id || !formData.claim_type || !formData.incident_date || !formData.incident_description}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tải tài liệu chứng minh</h2>
              <p className="text-gray-600 text-sm mb-6">Tải lên hóa đơn, biên bản, hình ảnh liên quan đến sự cố</p>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors mb-6">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-500 mb-2">Kéo thả hoặc chọn tệp</p>
                <p className="text-xs text-gray-400 mb-3">PDF, JPG, PNG - Tối đa 10MB/tệp</p>
                <input type="file" multiple accept="image/*,.pdf" onChange={handleFileAdd} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
                  Chọn tệp
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mb-6">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu bồi thường'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimSubmitPage;
