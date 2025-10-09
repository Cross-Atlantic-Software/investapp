export interface StockData {
  company_name: string;
  logo: string;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  founded: number;
  sector: string;
  subsector: string;
  headquarters: string;
  min_units: number;
  lot_size: number;
  stock_master_ids: number[];
  icon: File | null;
}

export interface ImageUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (stockData: StockData) => void;
  stockMasters?: Array<{
    id: number;
    name: string;
  }>;
}

export interface StepProps {
  formData: StockData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFormDataChange: (updates: Partial<StockData>) => void;
  stockMasters?: Array<{
    id: number;
    name: string;
  }>;
}

export interface ImageUploadProps {
  imageUpload: ImageUploadState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
}

// Financial Data Types
export interface FinancialKpi {
  id: number;
  category: 'income_statement' | 'balance_sheet' | 'cash_flow';
  name: string;
  display_order: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface StockFinancialData {
  kpi_id: number;
  name: string;
  unit: string;
  display_order: number;
  values: Record<number, number | null>;
}

export interface FinancialDataResponse {
  success: boolean;
  data: {
    kpis: StockFinancialData[];
    years: number[];
    category: string;
  };
}

export interface FinancialDataUploadResponse {
  success: boolean;
  message: string;
  data: {
    inserted: number;
    updated: number;
    totalProcessed: number;
  };
}

// Component Props
export interface FinancialPerformanceSectionProps {
  stockId: string;
}

export interface FinancialDataUploadProps {
  stockId: string;
  stockName: string;
  onUploadSuccess?: () => void;
}

// Shareholding Types
export interface StockShareholding {
  id: number;
  stock_id: number;
  holder_name: string;
  percentage: number;
  holder_type?: string;
  shareholder_type_id?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShareholderType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareholdingFormData {
  holder_name: string;
  percentage: number;
  holder_type?: string;
  shareholder_type_id?: number;
}

export interface ShareholdingManagementProps {
  stockId: string;
  stockName: string;
  onClose: () => void;
}