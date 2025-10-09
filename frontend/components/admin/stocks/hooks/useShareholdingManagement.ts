'use client';

import { useState } from 'react';

interface Stock {
  id: number;
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
  stock_masters?: Array<{
    id: number;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ShareholdingModalState {
  isOpen: boolean;
  stock: Stock | null;
}

export const useShareholdingManagement = () => {
  const [shareholdingModal, setShareholdingModal] = useState<ShareholdingModalState>({
    isOpen: false,
    stock: null
  });

  const openShareholdingModal = (stock: Stock) => {
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
