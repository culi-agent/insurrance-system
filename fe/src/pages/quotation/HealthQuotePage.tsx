import React, { useState } from 'react';
import HealthPersonalStep from './health-steps/HealthPersonalStep';
import HealthFamilyStep from './health-steps/HealthFamilyStep';
import HealthDeclarationStep from './health-steps/HealthDeclarationStep';
import HealthCoverageStep from './health-steps/HealthCoverageStep';
import HealthComparisonView from './health-steps/HealthComparisonView';

const STEPS = [
  { key: 'personal', label: 'Thông tin cá nhân', number: 1 },
  { key: 'family', label: 'Gia đình', number: 2 },
  { key: 'declaration', label: 'Khai báo sức khỏe', number: 3 },
  { key: 'coverage', label: 'Gói bảo hiểm', number: 4 },
  { key: 'comparison', label: 'So sánh', number: 5 },
] as const;

type StepKey = typeof STEPS[number]['key'];

export interface HealthFormData {
  plan_type: string;
  coverage_type: string;
  applicant: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    occupation: string;
    id_number: string;
    phone: string;
    email: string;
  };
  is_family_plan: boolean;
  family_members: Array<{
    full_name: string;
    date_of_birth: string;
    gender: string;
    relationship: string;
  }>;
  health_declaration: {
    height_cm: number;
    weight_kg: number;
    is_smoker: boolean;
    is_drinker: boolean;
    has_pre_existing_conditions: boolean;
    pre_existing_conditions: string[];
    has_hospitalized_last_5years: boolean;
    hospitalization_details: string;
    is_on_medication: boolean;
    medication_details: string;
    has_family_history: boolean;
    family_history_conditions: string[];
  };
  coverage_options: {
    annual_limit: number;
    deductible: number;
    room_type: string;
    include_dental: boolean;
    include_maternity: boolean;
    include_outpatient: boolean;
    include_wellness: boolean;
    geographic_coverage: string;
  };
  coverage_duration: number;
}

const defaultFormData: Partial<HealthFormData> = {
  plan_type: 'standard',
  coverage_type: 'comprehensive',
  applicant: { full_name: '', date_of_birth: '', gender: 'male', occupation: '', id_number: '', phone: '', email: '' },
  is_family_plan: false,
  family_members: [],
  health_declaration: {
    height_cm: 170, weight_kg: 65, is_smoker: false, is_drinker: false,
    has_pre_existing_conditions: false, pre_existing_conditions: [],
    has_hospitalized_last_5years: false, hospitalization_details: '',
    is_on_medication: false, medication_details: '',
    has_family_history: false, family_history_conditions: [],
  },
  coverage_options: {
    annual_limit: 1500000000, deductible: 0, room_type: 'standard',
    include_dental: false, include_maternity: false,
    include_outpatient: true, include_wellness: false, geographic_coverage: 'vietnam',
  },
  coverage_duration: 12,
};

const HealthQuotePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepKey>('personal');
  const [formData, setFormData] = useState<Partial<HealthFormData>>(defaultFormData);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const updateFormData = (data: Partial<HealthFormData>) => {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Báo Giá Bảo Hiểm Sức Khỏe</h1>
          <p className="text-gray-600 mt-2">Bảo vệ sức khỏe cho bạn và gia đình với gói bảo hiểm phù hợp</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < currentStepIndex ? 'bg-green-500 text-white'
                      : index === currentStepIndex ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : step.number}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 'personal' && <HealthPersonalStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />}
          {currentStep === 'family' && <HealthFamilyStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 'declaration' && <HealthDeclarationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 'coverage' && <HealthCoverageStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 'comparison' && <HealthComparisonView formData={formData as HealthFormData} onPrev={prevStep} />}
        </div>
      </div>
    </div>
  );
};

export default HealthQuotePage;
