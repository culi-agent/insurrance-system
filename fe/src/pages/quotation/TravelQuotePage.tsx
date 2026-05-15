import React, { useState } from 'react';
import TravelTripInfoStep from './travel-steps/TravelTripInfoStep';
import TravelTravelersStep from './travel-steps/TravelTravelersStep';
import TravelCoverageStep from './travel-steps/TravelCoverageStep';
import TravelComparisonView from './travel-steps/TravelComparisonView';

const STEPS = [
  { key: 'trip', label: 'Thông tin chuyến đi', number: 1 },
  { key: 'travelers', label: 'Người đi', number: 2 },
  { key: 'coverage', label: 'Gói bảo hiểm', number: 3 },
  { key: 'comparison', label: 'So sánh & Chọn', number: 4 },
] as const;

type StepKey = typeof STEPS[number]['key'];

export interface TravelFormData {
  trip_type: string;
  destination_type: string;
  destination_country: string;
  departure_date: string;
  return_date: string;
  trip_purpose: string;
  travelers: Array<{
    full_name: string;
    date_of_birth: string;
    id_number: string;
    is_primary: boolean;
  }>;
  plan_type: string;
  coverage_options: {
    medical_expense: boolean;
    trip_cancellation: boolean;
    trip_delay: boolean;
    baggage_loss: boolean;
    personal_accident: boolean;
    personal_liability: boolean;
    emergency_evacuation: boolean;
    flight_delay_compensation: boolean;
  };
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

const TravelQuotePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepKey>('trip');
  const [formData, setFormData] = useState<Partial<TravelFormData>>({
    trip_type: 'single',
    destination_type: 'asia',
    trip_purpose: 'leisure',
    travelers: [],
    plan_type: 'standard',
    coverage_options: {
      medical_expense: true,
      trip_cancellation: false,
      trip_delay: true,
      baggage_loss: true,
      personal_accident: true,
      personal_liability: true,
      emergency_evacuation: true,
      flight_delay_compensation: false,
    },
  });

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const updateFormData = (data: Partial<TravelFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].key);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Báo Giá Bảo Hiểm Du Lịch
          </h1>
          <p className="text-gray-600 mt-2">
            Bảo vệ chuyến đi của bạn với bảo hiểm du lịch toàn diện
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
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 'trip' && (
            <TravelTripInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
          )}
          {currentStep === 'travelers' && (
            <TravelTravelersStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'coverage' && (
            <TravelCoverageStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'comparison' && (
            <TravelComparisonView formData={formData as TravelFormData} onPrev={prevStep} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelQuotePage;
