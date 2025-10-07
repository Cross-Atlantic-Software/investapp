import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface StepProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  isStepCompleted: (step: number) => boolean;
  validateStep: (step: number) => boolean;
  goToStep: (step: number) => void;
}

const stepTitles = [
  'Basic Info',
  'Financial Details', 
  'Content & Description',
  'Display Settings',
  'Review & Submit'
];

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  isStepCompleted,
  validateStep,
  goToStep,
}) => {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <div className="flex items-center justify-between">
        {/* Steps with Arrow Connections */}
        <div className="flex-1 flex items-center">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCurrentStep = stepNumber === currentStep;
            const isCompletedStep = isStepCompleted(stepNumber);
            const isNextStep = stepNumber === currentStep + 1;
            const isAccessible = isCompletedStep || isCurrentStep || (isNextStep && isStepCompleted(currentStep));
            const isStepValid = validateStep(stepNumber);
            
            return (
              <React.Fragment key={stepNumber}>
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isAccessible && goToStep(stepNumber)}
                    disabled={!isAccessible}
                    className={`relative w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center ${
                      isCurrentStep
                        ? 'bg-themeTeal text-white shadow-lg scale-110'
                        : isCompletedStep
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                        : isAccessible
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                        : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                    title={
                      !isAccessible 
                        ? `Complete current step to proceed` 
                        : isCompletedStep 
                        ? `Completed: ${stepTitles[stepNumber - 1]} - click to go back` 
                        : isCurrentStep 
                        ? `Current: ${stepTitles[stepNumber - 1]} - ${isStepValid ? 'Valid' : 'Invalid'}` 
                        : `Next: ${stepTitles[stepNumber - 1]} - click to proceed`
                    }
                  >
                    {isCompletedStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </button>
                  
                  {/* Step Title */}
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium transition-colors duration-200 ${
                      isCurrentStep 
                        ? 'text-themeTeal' 
                        : isCompletedStep 
                        ? 'text-green-600' 
                        : isAccessible 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                    }`}>
                      {stepTitles[stepNumber - 1]}
                    </div>
                  </div>
                </div>
                
                {/* Arrow Connection */}
                {index < totalSteps - 1 && (
                  <div className="flex items-center mx-2">
                    <ChevronRight 
                      className={`w-4 h-4 transition-colors duration-300 ${
                        isCompletedStep 
                          ? 'text-green-500' 
                          : isCurrentStep 
                          ? 'text-themeTeal' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Progress Percentage - Right Side */}
        {currentStep > 1 && (
          <div className="ml-6">
            <div className="flex items-center px-3 py-1 bg-white rounded-full shadow-sm border">
              <div className="w-2 h-2 bg-themeTeal rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepProgressIndicator;
