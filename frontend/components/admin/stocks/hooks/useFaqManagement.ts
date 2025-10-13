import { useState } from 'react';

interface FaqModal {
  isOpen: boolean;
  stock: { id: number; company_name: string } | null;
}

export function useFaqManagement() {
  const [faqModal, setFaqModal] = useState<FaqModal>({
    isOpen: false,
    stock: null,
  });

  const openFaqModal = (stock: { id: number; company_name: string }) => {
    setFaqModal({
      isOpen: true,
      stock,
    });
  };

  const closeFaqModal = () => {
    setFaqModal({
      isOpen: false,
      stock: null,
    });
  };

  return {
    faqModal,
    openFaqModal,
    closeFaqModal,
  };
}


