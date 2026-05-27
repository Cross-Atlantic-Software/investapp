import { StockData } from './types';

// Helper function to validate all steps
const validateAllSteps = (formData: StockData): boolean => {
  return !!(
    // Step 1: Basic Company Information
    formData.company_name && 
    formData.company_name.trim() !== '' &&
    formData.founded && 
    formData.sector_ids && 
    formData.sector_ids.length > 0 &&
    formData.subsector_ids && 
    formData.subsector_ids.length > 0 &&
    formData.theme_ids && 
    formData.theme_ids.length > 0 &&
    formData.headquarters &&
    formData.headquarters.trim() !== '' &&
    // Note: icon validation removed for editing - existing stocks may not need new icon upload
    // Step 2: Financial Details
    formData.valuation && 
    formData.valuation.trim() !== '' &&
    formData.price_change !== null && 
    formData.price_change !== undefined &&
    formData.price_change_period_id &&
    formData.price_change_period_id > 0 &&
    formData.price_per_share && 
    formData.price_per_share > 0 &&
    formData.percentage_change !== null && 
    formData.percentage_change !== undefined &&
    formData.min_units && 
    formData.min_units > 0 &&
    formData.lot_size && 
    formData.lot_size > 0 &&
    // Step 3: Content & Description
    formData.teaser && formData.teaser.trim() !== '' &&
    formData.short_description && formData.short_description.trim() !== '' &&
    // Step 4: Display Settings & Tags
    formData.demand && 
    formData.homeDisplay && 
    formData.bannerDisplay && 
    formData.stock_master_ids.length > 0
  );
};

// Validation for editing existing stocks (more lenient)
export const validateStepForEdit = (step: number, formData: StockData): boolean => {
  switch (step) {
    case 1: // Basic Company Information
      return !!(
        formData.company_name && 
        formData.company_name.trim() !== '' &&
        formData.founded && 
        formData.headquarters &&
        formData.headquarters.trim() !== ''
        // Note: sectors/subsectors and icon are optional for editing
      );
    case 2: // Financial Details
      return !!(
        formData.valuation && 
        formData.valuation.trim() !== '' &&
        formData.price_change !== null && 
        formData.price_change !== undefined &&
        formData.price_change_period_id &&
        formData.price_change_period_id > 0 &&
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
        formData.teaser && formData.teaser.trim() !== '' &&
        formData.short_description && formData.short_description.trim() !== ''
      );
    case 4: // Display Settings & Tags
      return !!(
        formData.demand && 
        formData.homeDisplay && 
        formData.bannerDisplay && 
        Array.isArray(formData.stock_master_ids) && formData.stock_master_ids.length > 0
      );
    case 5: // Review & Submit
      return validateAllSteps(formData);
    default:
      return false;
  }
};

export const validateStep = (step: number, formData: StockData): boolean => {
  switch (step) {
    case 1: // Basic Company Information
      return !!(
        formData.company_name && 
        formData.company_name.trim() !== '' &&
        formData.founded && 
        formData.sector_ids && 
        formData.sector_ids.length > 0 &&
        formData.subsector_ids && 
        formData.subsector_ids.length > 0 &&
        formData.theme_ids && 
        formData.theme_ids.length > 0 &&
        formData.headquarters &&
        formData.headquarters.trim() !== ''
        // Note: icon validation removed for editing - existing stocks may not need new icon upload
      );
    case 2: // Financial Details
      return !!(
        formData.valuation && 
        formData.valuation.trim() !== '' &&
        formData.price_change !== null && 
        formData.price_change !== undefined &&
        formData.price_change_period_id &&
        formData.price_change_period_id > 0 &&
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
        formData.teaser && formData.teaser.trim() !== '' &&
        formData.short_description && formData.short_description.trim() !== ''
      );
    case 4: // Display Settings & Tags
      return !!(
        formData.demand && 
        formData.homeDisplay && 
        formData.bannerDisplay && 
        Array.isArray(formData.stock_master_ids) && formData.stock_master_ids.length > 0
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
