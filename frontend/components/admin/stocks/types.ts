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
