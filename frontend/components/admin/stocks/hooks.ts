import { useState, useCallback, useEffect } from 'react';
import { StockData, ImageUploadState } from './types';

export const useStockFormState = () => {
  const [formData, setFormData] = useState<StockData>({
    company_name: '',
    logo: '',
    price_change: 0,
    teaser: '',
    short_description: '',
    analysis: '',
    demand: 'High Demand',
    homeDisplay: 'no',
    bannerDisplay: 'no',
    valuation: '',
    price_per_share: 0,
    percentage_change: 0,
    founded: new Date().getFullYear(),
    sector_ids: [],
    subsector_ids: [],
    headquarters: '',
    min_units: 1,
    lot_size: 1,
    stock_master_ids: [],
    price_change_period_id: 4, // ID for '12 Months'
    icon: null as File | null,
  });

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

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

  const handleFormDataChange = useCallback((updates: Partial<StockData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    imageUpload,
    setImageUpload,
    handleInputChange,
    handleFormDataChange,
  };
};

export const useStepNavigation = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isStepCompleted = useCallback((step: number): boolean => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const markStepIncomplete = useCallback((step: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(step);
      return newSet;
    });
  }, []);

  const nextStep = useCallback((validateStep: (step: number) => boolean) => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      markStepCompleted(currentStep);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, markStepCompleted]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number, validateStep: (step: number) => boolean) => {
    if (step >= 1 && step <= totalSteps) {
      if (isStepCompleted(step) || step === currentStep) {
        setCurrentStep(step);
      } else if (step === currentStep + 1 && isStepCompleted(currentStep)) {
        setCurrentStep(step);
      }
    }
  }, [currentStep, totalSteps, isStepCompleted]);

  return {
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
  };
};

export const useDraftManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);

  const saveDraft = useCallback(async (
    formData: StockData,
    currentStep: number,
    totalSteps: number,
    validateStep: (step: number) => boolean,
    markStepCompleted: (step: number) => void,
    moveToNext: boolean = false
  ) => {
    try {
      setIsSavingDraft(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Clean form data for draft saving - remove File objects and logo field
      const { logo: _logo, ...cleanFormData } = formData;
      
      const response = await fetch('/api/admin/stock-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({
          draftData: cleanFormData,
          currentStep: currentStep
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDraftId(result.data.id);
        
        // Move to next step if requested and current step is valid
        if (moveToNext && validateStep(currentStep) && currentStep < totalSteps) {
          markStepCompleted(currentStep);
          
          // Save the draft again with the new step number
          const nextStepNumber = currentStep + 1;
          const updateResponse = await fetch('/api/admin/stock-drafts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'token': token,
            },
            body: JSON.stringify({
              draftData: cleanFormData,
              currentStep: nextStepNumber
            }),
          });
          
          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            if (updateResult.success) {
              setDraftId(updateResult.data.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }, []);

  const loadExistingDraft = useCallback(async (
    setFormData: (data: StockData) => void, 
    setCurrentStep: (step: number) => void, 
    setCompletedSteps: (steps: Set<number>) => void,
    validateStep: (step: number, formData: StockData) => boolean
  ) => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch('/api/admin/stock-drafts', {
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      });
      
      if (!response.ok) {
        console.log('No existing drafts found or error loading drafts');
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data.drafts.length > 0) {
        const draft = result.data.drafts[0];
        
        // Debug: Log draft data before setting
        console.log('Draft data being loaded:', draft.draft_data);
        console.log('Draft logo field type:', typeof draft.draft_data.logo);
        console.log('Draft logo field value:', draft.draft_data.logo);
        
        setFormData(draft.draft_data);
        setCurrentStep(draft.current_step);
        setDraftId(draft.id);
        
        // Validate each step based on actual form data to determine completion
        const completedStepsSet = new Set<number>();
        for (let i = 1; i <= 5; i++) {
          if (validateStep(i, draft.draft_data)) {
            completedStepsSet.add(i);
          }
        }
        setCompletedSteps(completedStepsSet);
      }
    } catch (error) {
      console.log('Error loading draft (this is normal if no drafts exist):', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDraft = useCallback(async () => {
    if (!draftId) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      await fetch(`/api/admin/stock-drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      });
      setDraftId(null);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }, [draftId]);

  return {
    isLoading,
    isSavingDraft,
    draftId,
    saveDraft,
    loadExistingDraft,
    deleteDraft,
  };
};
