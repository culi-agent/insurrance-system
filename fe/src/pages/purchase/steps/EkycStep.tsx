import React, { useState } from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { purchaseService } from '@/services/purchaseService';

const EkycStep: React.FC = () => {
  const { currentOrder, setEkycResult, nextStep, prevStep, setError } = usePurchaseStore();
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!frontImage || !backImage) {
      setError('Vui lòng chụp/tải ảnh mặt trước và mặt sau CCCD');
      return;
    }

    if (!currentOrder) {
      setError('Không tìm thấy đơn hàng');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const result = await purchaseService.performEkyc(currentOrder.id, {
        id_card_front_image: frontImage,
        id_card_back_image: backImage,
        selfie_image: selfieImage || undefined,
      });

      setEkycResult(result);
      setVerificationDone(true);

      if (result.ekyc_status === 'verified') {
        // Auto-run underwriting after successful eKYC
        const uwResult = await purchaseService.runUnderwriting(currentOrder.id);
        if (uwResult.underwriting_decision === 'auto_approved') {
          nextStep();
        } else if (uwResult.underwriting_decision === 'declined') {
          setError('Rất tiếc, hồ sơ của bạn không đủ điều kiện. Vui lòng liên hệ tư vấn.');
        } else {
          setError('Hồ sơ cần được xem xét thêm. Chúng tôi sẽ liên hệ bạn trong 24h.');
        }
      } else {
        setError('Xác minh thất bại. Vui lòng thử lại với ảnh rõ hơn.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi xác minh');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Xác Minh Danh Tính (eKYC)</h2>
      <p className="text-gray-600 mb-6">
        Chụp ảnh hoặc tải lên CCCD/CMND để xác minh danh tính tự động
      </p>

      <div className="space-y-6">
        {/* Front ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mặt trước CCCD/CMND <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {frontImage ? (
              <div className="relative">
                <img
                  src={frontImage}
                  alt="Mặt trước CCCD"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <button
                  onClick={() => setFrontImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 mb-2">Chụp hoặc tải ảnh mặt trước CCCD</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, setFrontImage)}
                  className="hidden"
                  id="front-upload"
                />
                <label
                  htmlFor="front-upload"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                >
                  Chọn ảnh
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Back ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mặt sau CCCD/CMND <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {backImage ? (
              <div className="relative">
                <img
                  src={backImage}
                  alt="Mặt sau CCCD"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <button
                  onClick={() => setBackImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 mb-2">Chụp hoặc tải ảnh mặt sau CCCD</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, setBackImage)}
                  className="hidden"
                  id="back-upload"
                />
                <label
                  htmlFor="back-upload"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                >
                  Chọn ảnh
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Selfie (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh chân dung (tùy chọn - tăng độ chính xác)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
            {selfieImage ? (
              <div className="relative inline-block">
                <img src={selfieImage} alt="Selfie" className="max-h-32 rounded-lg" />
                <button
                  onClick={() => setSelfieImage('')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFileChange(e, setSelfieImage)}
                  className="hidden"
                  id="selfie-upload"
                />
                <label
                  htmlFor="selfie-upload"
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 text-sm"
                >
                  Chụp ảnh chân dung
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </button>
        <button
          onClick={handleVerify}
          disabled={isVerifying || !frontImage || !backImage}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xác minh...
            </span>
          ) : (
            'Xác minh & Tiếp tục'
          )}
        </button>
      </div>
    </div>
  );
};

export default EkycStep;
