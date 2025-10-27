'use client';

import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { StockData, ExistingStockData, ImageUploadState } from './types';
import { useStepNavigation } from './hooks';
import { validateStepForEdit, validateImageFile } from './validation';
import StepProgressIndicator from './StepProgressIndicator';
import ModalFooter from './ModalFooter';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';

interface EditStockModalProps {
  stock: ExistingStockData;
  onClose: () => void;
  onSubmit: (stockData: StockData) => void;
  stockMasters?: Array<{
    id: number;
    name: string;
  }>;
  sectors?: Array<{
    id: number;
    name: string;
  }>;
  subsectors?: Array<{
    id: number;
    name: string;
    sector_id: number;
  }>;
  themes?: Array<{
    id: number;
    name: string;
  }>;
}

const EditStockModal: React.FC<EditStockModalProps> = ({ stock, onClose, onSubmit, stockMasters = [], sectors = [], subsectors = [], themes = [] }) => {
  const totalSteps = 5;
  
  // Parse the IDs from JSON strings
  const parsedSectorIds = Array.isArray(stock.sector_ids) ? stock.sector_ids : 
                          (typeof stock.sector_ids === 'string' ? JSON.parse(stock.sector_ids || '[]') : []);
  const parsedSubsectorIds = Array.isArray(stock.subsector_ids) ? stock.subsector_ids : 
                             (typeof stock.subsector_ids === 'string' ? JSON.parse(stock.subsector_ids || '[]') : []);
  const parsedThemeIds = Array.isArray(stock.theme_ids) ? stock.theme_ids : 
                         (typeof stock.theme_ids === 'string' ? JSON.parse(stock.theme_ids || '[]') : []);
  const parsedStockMasterIds = Array.isArray(stock.stock_master_ids) ? stock.stock_master_ids : 
                               (typeof stock.stock_master_ids === 'string' ? JSON.parse(stock.stock_master_ids || '[]') : []);
  
  // Initialize form data with existing stock data
  const [formData, setFormData] = React.useState<StockData>({
    company_name: stock.company_name || '',
    logo: stock.logo || '',
    price_change: stock.price_change || 0,
    teaser: stock.teaser || '',
    short_description: stock.short_description || '',
    analysis: stock.analysis || '',
    demand: stock.demand || 'High Demand',
    homeDisplay: stock.homeDisplay || 'no',
    bannerDisplay: stock.bannerDisplay || 'no',
    valuation: stock.valuation || '',
    price_per_share: stock.price_per_share || 0,
    percentage_change: stock.percentage_change || 0,
    founded: stock.founded || new Date().getFullYear(),
    sector_ids: parsedSectorIds,
    subsector_ids: parsedSubsectorIds,
    theme_ids: parsedThemeIds,
    headquarters: stock.headquarters || '',
    min_units: stock.min_units || 1,
    lot_size: stock.lot_size || 1,
    stock_master_ids: parsedStockMasterIds,
    price_change_period_id: stock.price_change_period_id ?? undefined,
    icon: null as File | null,
  });

  const [imageUpload, setImageUpload] = React.useState<ImageUploadState>({
    file: null,
    preview: stock.logo ? stock.logo : null,
    uploading: false,
    progress: 0,
    error: null,
  });

  const {
    currentStep,
    isStepCompleted,
    nextStep,
    prevStep,
    goToStep,
  } = useStepNavigation(totalSteps);

  // Validation function with current formData
  const validateCurrentStep = useCallback((step: number) => validateStepForEdit(step, formData), [formData]);

  // Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = [
      'price_change', 'price_per_share', 'percentage_change', 'founded', 
      'min_units', 'lot_size', 'price_change_period_id'
    ];
    
    const processedValue = numericFields.includes(name) ? 
      (name === 'price_change_period_id' ? parseInt(value, 10) : parseFloat(value)) : 
      value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  }, []);

  // Form data change handler
  const handleFormDataChange = useCallback((updates: Partial<StockData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

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
  }, [handleFormDataChange]);

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
    if (files && files[0]) {
      const file = files[0];
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
    }
  }, [handleFormDataChange]);

  const removeImage = useCallback(() => {
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
    handleFormDataChange({ icon: null });
  }, [handleFormDataChange]);

  // Navigation handlers
  const handleGoToStep = useCallback((step: number) => {
    goToStep(step, validateCurrentStep);
  }, [goToStep, validateCurrentStep]);

  const handleNextStep = useCallback(() => {
    nextStep(validateCurrentStep);
  }, [nextStep, validateCurrentStep]);

  const handlePrevStep = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const handleSaveAndNext = useCallback(() => {
    // For edit modal, we don't need to save drafts, just proceed to next step
    handleNextStep();
  }, [handleNextStep]);

  // Form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare form data with proper image handling
    const submitData = {
      ...formData,
      logo: '', // Don't send preview URL - backend will handle the file
      icon: imageUpload.file, // Send the actual file object
    };
    
    onSubmit(submitData);
  }, [formData, imageUpload, onSubmit]);

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
      <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Edit Stock</h3>
              <p className="text-xs text-themeTealWhite mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X/>
            </button>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <StepProgressIndicator
          totalSteps={totalSteps}
          currentStep={currentStep}
          isStepCompleted={isStepCompleted}
          validateStep={validateCurrentStep}
          goToStep={handleGoToStep}
        />

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <form id="edit-stock-form" onSubmit={handleSubmit}>
            {renderStepContent()}
          </form>
        </div>

        {/* Modal Footer */}
        <ModalFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSavingDraft={false}
          validateStep={validateCurrentStep}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onSaveAndNext={handleSaveAndNext}
          isEditMode={true}
        />
      </div>
    </div>
  );
};

export default EditStockModal;
