import { StockData } from './types';

// Helper function to validate all steps
const validateAllSteps = (formData: StockData): boolean => {
  return !!(
    // Step 1: Basic Company Information
    formData.company_name && 
    formData.company_name.trim() !== '' &&
    formData.founded && 
    formData.sector && 
    formData.subsector && 
    formData.headquarters &&
    formData.headquarters.trim() !== '' &&
    // Step 2: Financial Details
    formData.valuation && 
    formData.valuation.toString().trim() !== '' &&
    formData.price_per_share && 
    formData.price_per_share > 0 &&
    formData.percentage_change !== null && 
    formData.percentage_change !== undefined &&
    formData.min_units && 
    formData.min_units > 0 &&
    formData.lot_size && 
    formData.lot_size > 0 &&
    // Step 3: Content & Description
    formData.teaser.trim() !== '' &&
    formData.short_description.trim() !== '' &&
    formData.analysis.trim() !== '' &&
    // Step 4: Display Settings & Tags
    formData.demand && 
    formData.homeDisplay && 
    formData.bannerDisplay && 
    formData.stock_master_ids.length > 0
  );
};

export const validateStep = (step: number, formData: StockData): boolean => {
  switch (step) {
    case 1: // Basic Company Information
      return !!(
        formData.company_name && 
        formData.company_name.trim() !== '' &&
        formData.founded && 
        formData.sector && 
        formData.subsector && 
        formData.headquarters &&
        formData.headquarters.trim() !== ''
      );
    case 2: // Financial Details
      return !!(
        formData.valuation && 
        formData.valuation.toString().trim() !== '' &&
        formData.price_per_share && 
        formData.price_per_share > 0 &&
        formData.percentage_change !== null && 
        formData.percentage_change !== undefined &&
        formData.min_units && 
        formData.min_units > 0 &&
        formData.lot_size && 
        formData.lot_size > 0
      );
    case 3: // Content & Description
      return !!(
        formData.teaser.trim() !== '' &&
        formData.short_description.trim() !== '' &&
        formData.analysis.trim() !== ''
      );
    case 4: // Display Settings & Tags
      return !!(
        formData.demand && 
        formData.homeDisplay && 
        formData.bannerDisplay && 
        formData.stock_master_ids.length > 0
      );
    case 5: // Review & Submit
      return validateAllSteps(formData);
    default:
      return false;
  }
};

export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select a valid image file (PNG, JPG, GIF, etc.)';
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }
  
  return null;
};
