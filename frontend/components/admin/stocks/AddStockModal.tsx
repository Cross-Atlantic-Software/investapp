'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AddStockModalProps } from './types';
import { useStockFormState, useStepNavigation, useDraftManagement } from './hooks';
import { validateStep, validateImageFile } from './validation';
import StepProgressIndicator from './StepProgressIndicator';
import ModalFooter from './ModalFooter';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit, stockMasters = [], sectors = [], subsectors = [], themes = [] }) => {
  const totalSteps = 5;
  
  // Custom hooks
  const {
    formData,
    setFormData,
    imageUpload,
    setImageUpload,
    handleInputChange,
    handleFormDataChange,
  } = useStockFormState();

  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    isStepCompleted,
    markStepCompleted,
    markStepIncomplete,
    nextStep,
    prevStep,
    goToStep,
  } = useStepNavigation(totalSteps);

  const {
    isLoading,
    isSavingDraft,
    draftId,
    saveDraft,
    loadExistingDraft,
    deleteDraft,
  } = useDraftManagement();

  // Validation function with current formData
  const validateCurrentStep = useCallback((step: number) => validateStep(step, formData), [formData]);

  // File handling functions
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setImageUpload({
        file: null,
        preview: null,
        uploading: false,
        progress: 0,
        error: null,
      });
      handleFormDataChange({ icon: null });
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageUpload(prev => ({
        ...prev,
        error: validationError,
        file: null,
        preview: null,
      }));
      return;
    }

    const preview = URL.createObjectURL(file);
    
    setImageUpload({
      file,
      preview,
      uploading: false,
      progress: 0,
      error: null,
    });
    
    handleFormDataChange({ icon: file });
  }, [setImageUpload, handleFormDataChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(syntheticEvent);
    }
  }, [handleFileChange]);

  const removeImage = useCallback(() => {
    if (imageUpload.preview) {
      URL.revokeObjectURL(imageUpload.preview);
    }
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
    handleFormDataChange({ icon: null });
  }, [imageUpload.preview, setImageUpload, handleFormDataChange]);

  // Step navigation handlers
  const handleNextStep = useCallback(() => {
    nextStep(validateCurrentStep);
  }, [nextStep, validateCurrentStep]);

  const handleSaveAndNext = useCallback(async () => {
    await saveDraft(formData, currentStep, totalSteps, validateCurrentStep, markStepCompleted, true);
    if (validateCurrentStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep((prev: number) => prev + 1);
    }
  }, [saveDraft, formData, currentStep, totalSteps, validateCurrentStep, markStepCompleted, setCurrentStep]);

  const handleGoToStep = useCallback((step: number) => {
    goToStep(step, validateCurrentStep);
  }, [goToStep, validateCurrentStep]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (draftId) {
      await deleteDraft();
    }
    
    // Debug: Log form data before cleaning
    console.log('Form data before cleaning:', formData);
    console.log('Image upload state:', imageUpload);
    
    // Prepare form data with proper image handling
    const submitData = {
      ...formData,
      logo: '', // Don't send preview URL - backend will handle the file
      icon: imageUpload.file, // Send the actual file object
    };
    
    console.log('Final data being sent:', submitData);
    
    onSubmit(submitData);
  }, [draftId, deleteDraft, formData, imageUpload, onSubmit]);

  // Load existing draft on mount
  useEffect(() => {
    loadExistingDraft(setFormData, setCurrentStep, setCompletedSteps, validateStep);
  }, [loadExistingDraft, setFormData, setCurrentStep, setCompletedSteps]);

  // Track step completion when form data changes
  useEffect(() => {
    if (isStepCompleted(currentStep) && !validateCurrentStep(currentStep)) {
      markStepIncomplete(currentStep);
    }
  }, [formData, currentStep, isStepCompleted, validateCurrentStep, markStepIncomplete]);

  // Render step content
  const renderStepContent = () => {
    const stepProps = {
      formData,
      onInputChange: handleInputChange,
      onFormDataChange: handleFormDataChange,
      stockMasters,
      sectors,
      subsectors,
      themes,
    };

    switch (currentStep) {
      case 1:
        return (
          <Step1
            {...stepProps}
            imageUpload={imageUpload}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveImage={removeImage}
          />
        );
      case 2:
        return <Step2 {...stepProps} />;
      case 3:
        return <Step3 {...stepProps} />;
      case 4:
        return <Step4 {...stepProps} />;
      case 5:
        return <Step5 {...stepProps} imageUpload={imageUpload} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 m-0">
      <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col overflow-visible">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Add New Stock</h3>
              <p className="text-xs text-themeTealWhite mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
            <div className="flex items-center space-x-2">
              {isSavingDraft && (
                <div className="flex items-center text-themeTealWhite text-xs">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Saving...
                </div>
              )}
              <button
                onClick={onClose}
                className="text-themeTealWhite transition duration-300 cursor-pointer"
              >
                <X/>
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="relative z-10">
          <StepProgressIndicator
            totalSteps={totalSteps}
            currentStep={currentStep}
            isStepCompleted={isStepCompleted}
            validateStep={validateCurrentStep}
            goToStep={handleGoToStep}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto relative z-0 overflow-x-visible">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-themeTeal" />
            </div>
          ) : (
            <form id="stock-form" onSubmit={handleSubmit}>
              {renderStepContent()}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <ModalFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSavingDraft={isSavingDraft}
          validateStep={validateCurrentStep}
          onPrevStep={prevStep}
          onNextStep={handleNextStep}
          onSaveAndNext={handleSaveAndNext}
        />
      </div>
    </div>
  );
};

export default AddStockModal;