'use client';

import { useState } from 'react';
import { ExistingStockData } from '../types';

interface ShareholdingModalState {
  isOpen: boolean;
  stock: ExistingStockData | null;
}

export const useShareholdingManagement = () => {
  const [shareholdingModal, setShareholdingModal] = useState<ShareholdingModalState>({
    isOpen: false,
    stock: null
  });

  const openShareholdingModal = (stock: ExistingStockData) => {
    setShareholdingModal({ isOpen: true, stock });
  };

  const closeShareholdingModal = () => {
    setShareholdingModal({ isOpen: false, stock: null });
  };

  return {
    shareholdingModal,
    openShareholdingModal,
    closeShareholdingModal
  };
};
