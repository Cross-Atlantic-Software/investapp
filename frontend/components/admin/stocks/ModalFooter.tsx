import React from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface ModalFooterProps {
  currentStep: number;
  totalSteps: number;
  isSavingDraft: boolean;
  validateStep: (step: number) => boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSaveAndNext: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  currentStep,
  totalSteps,
  isSavingDraft,
  validateStep,
  onPrevStep,
  onNextStep,
  onSaveAndNext,
}) => {
  return (
    <div className="px-6 py-4 bg-themeTealWhite flex justify-between items-center flex-shrink-0 rounded-b-2xl">
      <div className="flex space-x-2">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevStep}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200 font-medium cursor-pointer flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
        )}
      </div>
      
      <div className="flex space-x-2">
        {currentStep < totalSteps ? (
          <>
            <button
              type="button"
              onClick={onSaveAndNext}
              disabled={isSavingDraft}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50 font-medium cursor-pointer flex items-center"
            >
              {isSavingDraft ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save & Next
            </button>
            
            <button
              type="button"
              onClick={onNextStep}
              disabled={!validateStep(currentStep)}
              className="px-5 py-2 text-sm bg-themeTeal text-white rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50 font-medium cursor-pointer flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </>
        ) : (
          <button
            type="submit"
            form="stock-form"
            className="px-5 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 font-medium cursor-pointer"
          >
            Add Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalFooter;
