export interface StockMasterItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface NewStockMasterForm {
  name: string;
}

export interface StockMasterTableProps {
  stockMasters: StockMasterItem[];
  loading: boolean;
  onEdit: (stockMaster: StockMasterItem) => void;
  onDelete: (id: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export interface StockMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewStockMasterForm) => void;
  editingItem?: StockMasterItem | null;
  initialData?: NewStockMasterForm;
  title: string;
  submitLabel: string;
  loading?: boolean;
}
