export interface NotableActivityItem {
  id: number;
  activity_type_ids: string;
  icon: string;
  description: string;
  created_at: string;
  updated_at: string;
  activity_types?: ActivityTypeItem[];
}

export interface ActivityTypeItem {
  id: number;
  name: string;
}

export interface NewActivityForm {
  description: string;
  icon: File | null;
  activity_type_ids: number[];
}

export interface NewActivityTypeForm {
  name: string;
}

export interface NotableActivityTableProps {
  activities: NotableActivityItem[];
  loading: boolean;
  onEdit: (activity: NotableActivityItem) => void;
  onDelete: (id: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewActivityForm) => void;
  activityTypes: ActivityTypeItem[];
  editingItem?: NotableActivityItem | null;
  initialData?: NewActivityForm;
  title: string;
  submitLabel: string;
  loading?: boolean;
}

export interface ActivityTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTypes: ActivityTypeItem[];
  onCreateActivityType: (data: NewActivityTypeForm) => void;
  onDeleteActivityType: (id: number) => void;
  newActivityType: NewActivityTypeForm;
  setNewActivityType: (data: NewActivityTypeForm) => void;
}
