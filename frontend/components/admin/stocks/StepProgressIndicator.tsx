import React from 'react';

interface StepProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  isStepCompleted: (step: number) => boolean;
  validateStep: (step: number) => boolean;
  goToStep: (step: number) => void;
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  isStepCompleted,
  validateStep,
  goToStep,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCurrentStep = stepNumber === currentStep;
            const isCompletedStep = isStepCompleted(stepNumber);
            const isNextStep = stepNumber === currentStep + 1;
            const isRequiredStep = stepNumber <= 5;
            const isAccessible = isCompletedStep || isCurrentStep || (isNextStep && isStepCompleted(currentStep));
            const isStepValid = validateStep(stepNumber);
            
            return (
              <button
                key={stepNumber}
                onClick={() => isAccessible && goToStep(stepNumber)}
                disabled={!isAccessible}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-200 relative ${
                  isCurrentStep
                    ? 'bg-themeTeal text-white'
                    : isCompletedStep
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isAccessible
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                title={
                  !isAccessible 
                    ? `Complete current step to proceed${isRequiredStep ? ' (Required)' : ''}` 
                    : isCompletedStep 
                    ? `Completed step - click to go back${isRequiredStep ? ' (Required)' : ''}` 
                    : isCurrentStep 
                    ? `Current step${isRequiredStep ? ' (Required)' : ''} - ${isStepValid ? 'Valid' : 'Invalid'}` 
                    : `Next step - click to proceed${isRequiredStep ? ' (Required)' : ''}`
                }
              >
                {stepNumber}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </div>
      </div>
    </div>
  );
};

export default StepProgressIndicator;
