import { useState } from 'react';

interface NewsSectionModalState {
  isOpen: boolean;
  stock: { id: number; company_name: string } | null;
}

export const useNewsSectionManagement = () => {
  const [newsSectionModal, setNewsSectionModal] = useState<NewsSectionModalState>({
    isOpen: false,
    stock: null,
  });

  const openNewsSectionModal = (stock: { id: number; company_name: string }) => {
    setNewsSectionModal({
      isOpen: true,
      stock,
    });
  };

  const closeNewsSectionModal = () => {
    setNewsSectionModal({
      isOpen: false,
      stock: null,
    });
  };

  return {
    newsSectionModal,
    openNewsSectionModal,
    closeNewsSectionModal,
  };
};
