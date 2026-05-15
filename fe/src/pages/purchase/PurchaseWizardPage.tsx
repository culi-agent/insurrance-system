import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePurchaseStore } from '@/stores/purchaseStore';
import ApplicantInfoStep from './steps/ApplicantInfoStep';
import BeneficiaryStep from './steps/BeneficiaryStep';
import EkycStep from './steps/EkycStep';
import ReviewStep from './steps/ReviewStep';
import PaymentStep from './steps/PaymentStep';

const WIZARD_STEPS = [
  { key: 'applicant', label: 'Thông tin người mua', number: 1 },
  { key: 'beneficiary', label: 'Người thụ hưởng', number: 2 },
  { key: 'ekyc', label: 'Xác minh danh tính', number: 3 },
  { key: 'review', label: 'Xem lại', number: 4 },
  { key: 'payment', label: 'Thanh toán', number: 5 },
] as const;

const PurchaseWizardPage: React.FC = () => {
  const { currentStep, reset } = usePurchaseStore();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('quotation_id');

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStep);

  useEffect(() => {
    return () => {
      // Reset on unmount
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mua Bảo Hiểm</h1>
          <p className="text-gray-600 mt-2">
            Hoàn tất thông tin để mua bảo hiểm trực tuyến
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 hidden sm:block ${
                      index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 'applicant' && <ApplicantInfoStep quotationId={quotationId} />}
          {currentStep === 'beneficiary' && <BeneficiaryStep />}
          {currentStep === 'ekyc' && <EkycStep />}
          {currentStep === 'review' && <ReviewStep />}
          {currentStep === 'payment' && <PaymentStep />}
        </div>
      </div>
    </div>
  );
};

export default PurchaseWizardPage;
