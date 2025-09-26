export interface PrivateMarketNewsItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  taxonomy_ids: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyItem {
  id: number;
  name: string;
  color: string;
}

export interface NewNewsForm {
  title: string;
  url: string;
  icon: File | null;
  taxonomy_ids: number[];
}

export interface NewTaxonomyForm {
  name: string;
  color: string;
}

export interface NewsTableProps {
  news: PrivateMarketNewsItem[];
  loading: boolean;
  onEdit: (item: PrivateMarketNewsItem) => void;
  onDelete: (id: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  formatDate: (dateString: string) => string;
  parseTaxonomyIds: (taxonomyIds: string) => number[];
  taxonomies: TaxonomyItem[];
}

export interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewNewsForm) => void;
  taxonomies: TaxonomyItem[];
  editingItem?: PrivateMarketNewsItem | null;
  initialData?: NewNewsForm;
  title: string;
  submitLabel: string;
  loading?: boolean;
  onTaxonomyModalOpen: () => void;
}

export interface TaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxonomies: TaxonomyItem[];
  onCreateTaxonomy: (data: NewTaxonomyForm) => void;
  onDeleteTaxonomy: (id: number) => void;
  newTaxonomy: NewTaxonomyForm;
  setNewTaxonomy: (data: NewTaxonomyForm) => void;
}
