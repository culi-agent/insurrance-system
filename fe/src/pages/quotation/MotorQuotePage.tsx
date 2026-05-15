import React from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import VehicleInfoStep from './steps/VehicleInfoStep';
import CoverageStep from './steps/CoverageStep';
import OwnerInfoStep from './steps/OwnerInfoStep';
import ComparisonView from './ComparisonView';

const STEPS = [
  { key: 'vehicle', label: 'Thông tin xe', number: 1 },
  { key: 'coverage', label: 'Quyền lợi', number: 2 },
  { key: 'owner', label: 'Chủ xe', number: 3 },
  { key: 'comparison', label: 'So sánh', number: 4 },
] as const;

const MotorQuotePage: React.FC = () => {
  const { currentStep } = useQuotationStore();

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Báo Giá Bảo Hiểm Xe Cơ Giới
          </h1>
          <p className="text-gray-600 mt-2">
            Nhận báo giá từ nhiều nhà bảo hiểm - so sánh và chọn phù hợp nhất
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStepIndex
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
                    className={`text-xs mt-1 ${
                      index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 'vehicle' && <VehicleInfoStep />}
          {currentStep === 'coverage' && <CoverageStep />}
          {currentStep === 'owner' && <OwnerInfoStep />}
          {currentStep === 'comparison' && <ComparisonView />}
        </div>
      </div>
    </div>
  );
};

export default MotorQuotePage;
