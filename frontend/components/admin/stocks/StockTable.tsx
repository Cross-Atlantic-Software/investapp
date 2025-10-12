'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { Loader } from '@/components/admin/shared';
import { ChevronDown, Eye, IndianRupee, SquarePen, Trash2, X, Upload, BarChart3, Plus, Edit3, FileText, AlertTriangle, TrendingUp, MoreVertical } from 'lucide-react';
import CSVUploadModal from './CSVUploadModal';
import ConfirmationModal from '@/components/admin/shared/ConfirmationModal';
import EditStockModal from './EditStockModal';
import ViewStockModal from './ViewStockModal';
import StockModulesSidebar from './StockModulesSidebar';
import FinancialDataUpload from './FinancialDataUpload';
import ShareholdingManagement from './ShareholdingManagement';
import { ExistingStockData, StockData } from './types';
import { useNewsSectionManagement } from './hooks/useNewsSectionManagement';
import NewsSectionManagement from './NewsSectionManagement';
import { useShareholdingManagement } from './hooks/useShareholdingManagement';
import { useFaqManagement } from './hooks/useFaqManagement';
import FaqManagement from './FaqManagement';

type Stock = ExistingStockData;

interface Scorecard {
  id: number;
  stock_id: number;
  category: string;
  score_value: number;
  score_tag: 'Low Risk' | 'Medium Risk' | 'High Risk';
  analysis: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentRationale {
  id: number;
  stock_id: number;
  type: 'pros' | 'risks';
  title: string;
  description: string;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface PerformancePdf {
  id: number;
  stock_id: number;
  title: string;
  description?: string;
  pdf_url: string;
  file_name: string;
  file_size: number;
  page_count: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SectorInsightsPdf {
  id: number;
  stock_id: number;
  title: string;
  description?: string;
  pdf_url: string;
  file_name: string;
  file_size: number;
  page_count: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockTableProps {
  stocks: Stock[];
  onRefresh: () => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onNotification?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  stockMasters?: Array<{
    id: number;
    name: string;
  }>;
  sectors?: Array<{
    id: number;
    name: string;
  }>;
  subsectors?: Array<{
    id: number;
    name: string;
    sector_id: number;
  }>;
}


// Utility function to strip HTML tags
// const stripHtmlTags = (html: string): string => {
//   const tempDiv = document.createElement('div');
//   tempDiv.innerHTML = html;
//   return tempDiv.textContent || tempDiv.innerText || '';
// };


const StockTable: React.FC<StockTableProps> = ({ stocks, onRefresh, onSort, sortBy, sortOrder, onNotification, stockMasters = [], sectors = [], subsectors = [] }) => {
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [viewingStock, setViewingStock] = useState<Stock | null>(null);
  const [csvUploadModal, setCsvUploadModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  
  // Scorecard management state
  const [scorecardModal, setScorecardModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [editingScorecard, setEditingScorecard] = useState<Scorecard | null>(null);
  const [scorecardFormData, setScorecardFormData] = useState<Partial<Scorecard>>({});
  
  // Investment Rationale management state
  const [rationaleModal, setRationaleModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  const [rationales, setRationales] = useState<{ pros: InvestmentRationale[]; risks: InvestmentRationale[] }>({
    pros: [],
    risks: []
  });
  const [rationaleLoading, setRationaleLoading] = useState(false);
  const [editingRationale, setEditingRationale] = useState<InvestmentRationale | null>(null);
  const [rationaleFormData, setRationaleFormData] = useState<Partial<InvestmentRationale>>({});
  const [rationaleIconFile, setRationaleIconFile] = useState<File | null>(null);
  
  // Performance PDF management state
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  const [pdfs, setPdfs] = useState<PerformancePdf[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editingPdf, setEditingPdf] = useState<PerformancePdf | null>(null);
  const [pdfFormData, setPdfFormData] = useState<Partial<PerformancePdf>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [replacingPdf, setReplacingPdf] = useState<PerformancePdf | null>(null);
  
  // Sector Outlook management state
  const [sectorOutlookModal, setSectorOutlookModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  const [, setSectorOutlook] = useState<{ description: string; accordions: Array<{ title: string; analysis: string; order_index: number }> } | null>(null);
  const [sectorOutlookLoading, setSectorOutlookLoading] = useState(false);
  const [sectorOutlookFormData, setSectorOutlookFormData] = useState<{ description: string; accordions: Array<{ title: string; analysis: string; order_index: number }> }>({
    description: '',
    accordions: []
  });
  
  // Sector Insights PDF management state
  const [sectorInsightsPdfModal, setSectorInsightsPdfModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  // Shareholding management hook
  const { shareholdingModal, openShareholdingModal, closeShareholdingModal } = useShareholdingManagement();
  
  // News section management hook
  const { newsSectionModal, openNewsSectionModal, closeNewsSectionModal } = useNewsSectionManagement();
  const { faqModal, openFaqModal, closeFaqModal } = useFaqManagement();
  const [financialDataModal, setFinancialDataModal] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null
  });
  const [sectorInsightsPdfs, setSectorInsightsPdfs] = useState<SectorInsightsPdf[]>([]);
  const [sectorInsightsPdfLoading, setSectorInsightsPdfLoading] = useState(false);
  const [editingSectorInsightsPdf, setEditingSectorInsightsPdf] = useState<SectorInsightsPdf | null>(null);
  const [sectorInsightsPdfFormData, setSectorInsightsPdfFormData] = useState<Partial<SectorInsightsPdf>>({});
  const [sectorInsightsPdfFile, setSectorInsightsPdfFile] = useState<File | null>(null);
  const [replacingSectorInsightsPdf, setReplacingSectorInsightsPdf] = useState<SectorInsightsPdf | null>(null);
  
  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; stockId: number | null; stockName: string }>({
    isOpen: false,
    stockId: null,
    stockName: ''
  });

  // Additional confirmation modal states
  const [scorecardDeleteConfirmation, setScorecardDeleteConfirmation] = useState<{ isOpen: boolean; scorecardId: number | null }>({
    isOpen: false,
    scorecardId: null
  });

  const [rationaleDeleteConfirmation, setRationaleDeleteConfirmation] = useState<{ isOpen: boolean; rationaleId: number | null }>({
    isOpen: false,
    rationaleId: null
  });

  const [pdfDeleteConfirmation, setPdfDeleteConfirmation] = useState<{ isOpen: boolean; pdfId: number | null }>({
    isOpen: false,
    pdfId: null
  });

  const [sectorInsightsPdfDeleteConfirmation, setSectorInsightsPdfDeleteConfirmation] = useState<{ isOpen: boolean; pdfId: number | null }>({
    isOpen: false,
    pdfId: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Dropdown state for module management
  // const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarStock, setSidebarStock] = useState<Stock | null>(null);

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role;
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
    return null;
  };

  const currentUserRole = getCurrentUserRole();
  const canManageStocks = currentUserRole === 10 || currentUserRole === 11; // Admin or SuperAdmin

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
  };

  // const removeImage = () => {
  //   if (imageUpload.preview) {
  //     URL.revokeObjectURL(imageUpload.preview);
  //   }
  //   setImageUpload({
  //     file: null,
  //     preview: null,
  //     uploading: false,
  //     progress: 0,
  //     error: null,
  //   });
  //   setEditIconFile(null);
  // };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // const handleDragEnter = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // const handleDragLeave = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
    
  //   const files = e.dataTransfer.files;
  //   if (files && files.length > 0) {
  //     const file = files[0];
      
  //     // Create a synthetic event to reuse the file change handler
  //     const syntheticEvent = {
  //       target: {
  //         files: [file]
  //       }
  //     } as unknown as React.ChangeEvent<HTMLInputElement>;
      
  //     handleFileChange(syntheticEvent);
  //   }
  // };

  const handleViewStock = (stock: Stock) => {
    setViewingStock(stock);
  };

  // Scorecard management functions
  const handleManageScorecards = async (stock: Stock) => {
    setScorecardModal({ isOpen: true, stock });
    await fetchScorecards(stock.id);
  };

  const fetchScorecards = async (stockId: number) => {
    setScorecardLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${stockId}/scorecards`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        setScorecards(data.data.scorecards || []);
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to fetch scorecards');
      }
    } catch (error) {
      console.error('Error fetching scorecards:', error);
      onNotification?.('error', 'Error', 'Failed to fetch scorecards');
    } finally {
      setScorecardLoading(false);
    }
  };

  const handleCreateScorecard = async () => {
    if (!scorecardModal.stock) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${scorecardModal.stock.id}/scorecards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          stock_id: scorecardModal.stock.id,
          category: scorecardFormData.category,
          score_value: scorecardFormData.score_value,
          score_tag: scorecardFormData.score_tag,
          analysis: scorecardFormData.analysis
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchScorecards(scorecardModal.stock.id);
        setScorecardFormData({});
        onNotification?.('success', 'Success', 'Scorecard created successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to create scorecard');
      }
    } catch (error) {
      console.error('Error creating scorecard:', error);
      onNotification?.('error', 'Error', 'Failed to create scorecard');
    }
  };

  const handleEditScorecard = (scorecard: Scorecard) => {
    setEditingScorecard(scorecard);
    setScorecardFormData({
      category: scorecard.category,
      score_value: scorecard.score_value,
      score_tag: scorecard.score_tag,
      analysis: scorecard.analysis
    });
  };

  const handleUpdateScorecard = async () => {
    if (!editingScorecard) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/scorecards/${editingScorecard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          category: scorecardFormData.category,
          score_value: scorecardFormData.score_value,
          score_tag: scorecardFormData.score_tag,
          analysis: scorecardFormData.analysis
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchScorecards(scorecardModal.stock!.id);
        setEditingScorecard(null);
        setScorecardFormData({});
        onNotification?.('success', 'Success', 'Scorecard updated successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to update scorecard');
      }
    } catch (error) {
      console.error('Error updating scorecard:', error);
      onNotification?.('error', 'Error', 'Failed to update scorecard');
    }
  };

  const handleDeleteScorecard = (scorecardId: number) => {
    setScorecardDeleteConfirmation({
      isOpen: true,
      scorecardId: scorecardId
    });
  };

  const confirmDeleteScorecard = async () => {
    if (!scorecardDeleteConfirmation.scorecardId) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/scorecards/${scorecardDeleteConfirmation.scorecardId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchScorecards(scorecardModal.stock!.id);
        onNotification?.('success', 'Success', 'Scorecard deleted successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to delete scorecard');
      }
    } catch (error) {
      console.error('Error deleting scorecard:', error);
      onNotification?.('error', 'Error', 'Failed to delete scorecard');
    }
  };

  // Investment Rationale management functions
  const handleManageRationales = async (stock: Stock) => {
    setRationaleModal({ isOpen: true, stock });
    await fetchRationales(stock.id);
  };

  const fetchRationales = async (stockId: number) => {
    setRationaleLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${stockId}/investment-rationales`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        setRationales(data.data.rationales || { pros: [], risks: [] });
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to fetch investment rationales');
      }
    } catch (error) {
      console.error('Error fetching investment rationales:', error);
      onNotification?.('error', 'Error', 'Failed to fetch investment rationales');
    } finally {
      setRationaleLoading(false);
    }
  };

  const handleCreateRationale = async () => {
    if (!rationaleModal.stock) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('stock_id', rationaleModal.stock.id.toString());
      formData.append('type', rationaleFormData.type || '');
      formData.append('title', rationaleFormData.title || '');
      formData.append('description', rationaleFormData.description || '');
      formData.append('order_index', (rationaleFormData.order_index || 0).toString());
      
      // Add icon file if provided
      if (rationaleIconFile) {
        formData.append('icon', rationaleIconFile);
      }
      
      const response = await fetch(`/api/admin/stocks/${rationaleModal.stock.id}/investment-rationales`, {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRationales(rationaleModal.stock.id);
        setRationaleFormData({});
        setRationaleIconFile(null);
        onNotification?.('success', 'Success', 'Investment rationale created successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to create investment rationale');
      }
    } catch (error) {
      console.error('Error creating investment rationale:', error);
      onNotification?.('error', 'Error', 'Failed to create investment rationale');
    }
  };

  const handleEditRationale = (rationale: InvestmentRationale) => {
    setEditingRationale(rationale);
    setRationaleFormData({
      type: rationale.type,
      title: rationale.title,
      description: rationale.description,
      icon: rationale.icon,
      order_index: rationale.order_index
    });
    setRationaleIconFile(null); // Reset icon file
  };

  const handleUpdateRationale = async () => {
    if (!editingRationale) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('type', rationaleFormData.type || '');
      formData.append('title', rationaleFormData.title || '');
      formData.append('description', rationaleFormData.description || '');
      formData.append('order_index', (rationaleFormData.order_index || 0).toString());
      
      // Add icon file if provided
      if (rationaleIconFile) {
        formData.append('icon', rationaleIconFile);
      }
      
      const response = await fetch(`/api/admin/investment-rationales/${editingRationale.id}`, {
        method: 'PUT',
        headers: {
          'token': token
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRationales(rationaleModal.stock!.id);
        setEditingRationale(null);
        setRationaleFormData({});
        setRationaleIconFile(null);
        onNotification?.('success', 'Success', 'Investment rationale updated successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to update investment rationale');
      }
    } catch (error) {
      console.error('Error updating investment rationale:', error);
      onNotification?.('error', 'Error', 'Failed to update investment rationale');
    }
  };

  const handleDeleteRationale = (rationaleId: number) => {
    setRationaleDeleteConfirmation({
      isOpen: true,
      rationaleId: rationaleId
    });
  };

  const confirmDeleteRationale = async () => {
    if (!rationaleDeleteConfirmation.rationaleId) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/investment-rationales/${rationaleDeleteConfirmation.rationaleId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRationales(rationaleModal.stock!.id);
        onNotification?.('success', 'Success', 'Investment rationale deleted successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to delete investment rationale');
      }
    } catch (error) {
      console.error('Error deleting investment rationale:', error);
      onNotification?.('error', 'Error', 'Failed to delete investment rationale');
    }
  };

  // Performance PDF management functions
  const handleManagePdfs = async (stock: Stock) => {
    setPdfModal({ isOpen: true, stock });
    await fetchPdfs(stock.id);
  };

  const fetchPdfs = async (stockId: number) => {
    setPdfLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${stockId}/performance-pdfs`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        setPdfs(data.data.pdfs || []);
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to fetch performance PDFs');
      }
    } catch (error) {
      console.error('Error fetching performance PDFs:', error);
      onNotification?.('error', 'Error', 'Failed to fetch performance PDFs');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCreatePdf = async () => {
    if (!pdfModal.stock || !pdfFile) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('stock_id', pdfModal.stock.id.toString());
      formData.append('title', pdfFormData.title || '');
      formData.append('description', pdfFormData.description || '');
      formData.append('order_index', (pdfFormData.order_index || 0).toString());
      
      const response = await fetch(`/api/admin/stocks/${pdfModal.stock.id}/performance-pdfs`, {
        method: 'POST',
        headers: { 'token': token },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPdfs(pdfModal.stock.id);
        setPdfFormData({});
        setPdfFile(null);
        onNotification?.('success', 'Success', 'Performance PDF uploaded successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to upload performance PDF');
      }
    } catch (error) {
      console.error('Error uploading performance PDF:', error);
      onNotification?.('error', 'Error', 'Failed to upload performance PDF');
    }
  };

  const handleEditPdf = (pdf: PerformancePdf) => {
    setEditingPdf(pdf);
    setPdfFormData({
      title: pdf.title,
      description: pdf.description,
      order_index: pdf.order_index,
      is_active: pdf.is_active
    });
  };

  const handleUpdatePdf = async () => {
    if (!editingPdf) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/performance-pdfs/${editingPdf.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          title: pdfFormData.title,
          description: pdfFormData.description,
          order_index: pdfFormData.order_index,
          is_active: pdfFormData.is_active
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPdfs(pdfModal.stock!.id);
        setEditingPdf(null);
        setPdfFormData({});
        onNotification?.('success', 'Success', 'Performance PDF updated successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to update performance PDF');
      }
    } catch (error) {
      console.error('Error updating performance PDF:', error);
      onNotification?.('error', 'Error', 'Failed to update performance PDF');
    }
  };

  const handleDeletePdf = (pdfId: number) => {
    setPdfDeleteConfirmation({
      isOpen: true,
      pdfId: pdfId
    });
  };

  const confirmDeletePdf = async () => {
    if (!pdfDeleteConfirmation.pdfId) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/performance-pdfs/${pdfDeleteConfirmation.pdfId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPdfs(pdfModal.stock!.id);
        onNotification?.('success', 'Success', 'Performance PDF deleted successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to delete performance PDF');
      }
    } catch (error) {
      console.error('Error deleting performance PDF:', error);
      onNotification?.('error', 'Error', 'Failed to delete performance PDF');
    }
  };

  const handleSetActivePdf = async (pdfId: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // First, set all PDFs to inactive
      const allPdfs = pdfs.filter(pdf => pdf.is_active);
      for (const pdf of allPdfs) {
        await fetch(`/api/admin/performance-pdfs/${pdf.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify({ is_active: false })
        });
      }
      
      // Then set the selected PDF to active
      const response = await fetch(`/api/admin/performance-pdfs/${pdfId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ is_active: true })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPdfs(pdfModal.stock!.id);
        onNotification?.('success', 'Success', 'PDF set as active successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to set PDF as active');
      }
    } catch (error) {
      console.error('Error setting PDF as active:', error);
      onNotification?.('error', 'Error', 'Failed to set PDF as active');
    }
  };

  const handleReplacePdf = async () => {
    if (!replacingPdf || !pdfFile) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      
      const response = await fetch(`/api/admin/performance-pdfs/${replacingPdf.id}/replace`, {
        method: 'PUT',
        headers: { 'token': token },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        if (pdfModal.stock?.id) {
          await fetchPdfs(pdfModal.stock.id);
        }
        setReplacingPdf(null);
        setPdfFile(null);
        onNotification?.('success', 'Success', 'PDF replaced successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to replace PDF');
      }
    } catch (error) {
      console.error('Error replacing PDF:', error);
      onNotification?.('error', 'Error', 'Failed to replace PDF');
    }
  };

  // Sector Outlook Management Functions
  const handleManageSectorOutlook = async (stock: Stock) => {
    setSectorOutlookModal({ isOpen: true, stock });
    await fetchSectorOutlook(stock.id);
  };

  const fetchSectorOutlook = async (stockId: number) => {
    setSectorOutlookLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${stockId}/sector-outlooks`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        if (data.data) {
          setSectorOutlook({
            description: data.data.description || '',
            accordions: data.data.accordions || []
          });
          setSectorOutlookFormData({
            description: data.data.description || '',
            accordions: data.data.accordions || []
          });
        } else {
          setSectorOutlook(null);
          setSectorOutlookFormData({
            description: '',
            accordions: []
          });
        }
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to fetch sector outlook');
      }
    } catch (error) {
      console.error('Error fetching sector outlook:', error);
      onNotification?.('error', 'Error', 'Failed to fetch sector outlook');
    } finally {
      setSectorOutlookLoading(false);
    }
  };

  const handleSaveSectorOutlook = async () => {
    if (!sectorOutlookModal.stock) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/stocks/${sectorOutlookModal.stock.id}/sector-outlooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          stock_id: sectorOutlookModal.stock.id,
          description: sectorOutlookFormData.description,
          accordions: sectorOutlookFormData.accordions
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSectorOutlook(sectorOutlookModal.stock.id);
        onNotification?.('success', 'Success', 'Sector outlook saved successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to save sector outlook');
      }
    } catch (error) {
      console.error('Error saving sector outlook:', error);
      onNotification?.('error', 'Error', 'Failed to save sector outlook');
    }
  };

  const addAccordionItem = () => {
    setSectorOutlookFormData(prev => ({
      ...prev,
      accordions: [...prev.accordions, { title: '', analysis: '', order_index: prev.accordions.length }]
    }));
  };

  const removeAccordionItem = (index: number) => {
    setSectorOutlookFormData(prev => ({
      ...prev,
      accordions: prev.accordions.filter((_, i) => i !== index)
    }));
  };

  const updateAccordionItem = (index: number, field: 'title' | 'analysis', value: string) => {
    setSectorOutlookFormData(prev => ({
      ...prev,
      accordions: prev.accordions.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Sector Insights PDF Management Functions
  const handleManageSectorInsightsPdfs = async (stock: Stock) => {
    setSectorInsightsPdfModal({ isOpen: true, stock });
    await fetchSectorInsightsPdfs(stock.id);
  };

  const fetchSectorInsightsPdfs = async (stockId: number) => {
    setSectorInsightsPdfLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${stockId}/sector-insights-pdfs`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        setSectorInsightsPdfs(data.data.pdfs || []);
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to fetch sector insights PDFs');
      }
    } catch (error) {
      console.error('Error fetching sector insights PDFs:', error);
      onNotification?.('error', 'Error', 'Failed to fetch sector insights PDFs');
    } finally {
      setSectorInsightsPdfLoading(false);
    }
  };

  const handleUploadSectorInsightsPdf = async () => {
    if (!sectorInsightsPdfModal.stock || !sectorInsightsPdfFile) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const formData = new FormData();
      formData.append('pdf', sectorInsightsPdfFile);
      formData.append('stock_id', sectorInsightsPdfModal.stock.id.toString());
      formData.append('title', sectorInsightsPdfFormData.title || 'Sector Insights PDF');
      formData.append('description', sectorInsightsPdfFormData.description || '');
      
      const response = await fetch(`/api/admin/stocks/${sectorInsightsPdfModal.stock.id}/sector-insights-pdfs`, {
        method: 'POST',
        headers: { 'token': token },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSectorInsightsPdfs(sectorInsightsPdfModal.stock.id);
        setSectorInsightsPdfFormData({});
        setSectorInsightsPdfFile(null);
        onNotification?.('success', 'Success', 'Sector insights PDF uploaded successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to upload sector insights PDF');
      }
    } catch (error) {
      console.error('Error uploading sector insights PDF:', error);
      onNotification?.('error', 'Error', 'Failed to upload sector insights PDF');
    }
  };

  const handleEditSectorInsightsPdf = (pdf: SectorInsightsPdf) => {
    setEditingSectorInsightsPdf(pdf);
    setSectorInsightsPdfFormData({
      title: pdf.title,
      description: pdf.description || '',
      order_index: pdf.order_index
    });
  };

  const handleUpdateSectorInsightsPdf = async () => {
    if (!editingSectorInsightsPdf) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/sector-insights-pdfs/${editingSectorInsightsPdf.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(sectorInsightsPdfFormData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSectorInsightsPdfs(sectorInsightsPdfModal.stock?.id || 0);
        setEditingSectorInsightsPdf(null);
        setSectorInsightsPdfFormData({});
        onNotification?.('success', 'Success', 'Sector insights PDF updated successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to update sector insights PDF');
      }
    } catch (error) {
      console.error('Error updating sector insights PDF:', error);
      onNotification?.('error', 'Error', 'Failed to update sector insights PDF');
    }
  };

  const handleDeleteSectorInsightsPdf = (pdfId: number) => {
    setSectorInsightsPdfDeleteConfirmation({
      isOpen: true,
      pdfId: pdfId
    });
  };

  const confirmDeleteSectorInsightsPdf = async () => {
    if (!sectorInsightsPdfDeleteConfirmation.pdfId) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/sector-insights-pdfs/${sectorInsightsPdfDeleteConfirmation.pdfId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSectorInsightsPdfs(sectorInsightsPdfModal.stock?.id || 0);
        onNotification?.('success', 'Success', 'Sector insights PDF deleted successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to delete sector insights PDF');
      }
    } catch (error) {
      console.error('Error deleting sector insights PDF:', error);
      onNotification?.('error', 'Error', 'Failed to delete sector insights PDF');
    }
  };

  const handleSetActiveSectorInsightsPdf = async (pdfId: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/sector-insights-pdfs/${pdfId}/set-active`, {
        method: 'PUT',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSectorInsightsPdfs(sectorInsightsPdfModal.stock?.id || 0);
        onNotification?.('success', 'Success', 'Sector insights PDF set as active!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to set PDF as active');
      }
    } catch (error) {
      console.error('Error setting sector insights PDF as active:', error);
      onNotification?.('error', 'Error', 'Failed to set PDF as active');
    }
  };

  const handleReplaceSectorInsightsPdf = async () => {
    if (!replacingSectorInsightsPdf || !sectorInsightsPdfFile) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const formData = new FormData();
      formData.append('pdf', sectorInsightsPdfFile);
      
      const response = await fetch(`/api/admin/sector-insights-pdfs/${replacingSectorInsightsPdf.id}/replace`, {
        method: 'PUT',
        headers: { 'token': token },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        if (sectorInsightsPdfModal.stock?.id) {
          await fetchSectorInsightsPdfs(sectorInsightsPdfModal.stock.id);
        }
        setReplacingSectorInsightsPdf(null);
        setSectorInsightsPdfFile(null);
        onNotification?.('success', 'Success', 'Sector insights PDF replaced successfully!');
      } else {
        onNotification?.('error', 'Error', data.message || 'Failed to replace sector insights PDF');
      }
    } catch (error) {
      console.error('Error replacing sector insights PDF:', error);
      onNotification?.('error', 'Error', 'Failed to replace sector insights PDF');
    }
  };

  // Toggle dropdown for module management
  // const toggleDropdown = (stockId: number) => {
  //   setDropdownOpen(prev => ({
  //     ...prev,
  //     [stockId]: !prev[stockId]
  //   }));
  // };

  const handleOpenSidebar = (stock: Stock) => {
    setSidebarStock(stock);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSidebarStock(null), 300); // Delay to allow animation
  };

  const handleSelectModule = (moduleId: string) => {
    if (!sidebarStock) return;

    // Keep sidebar open - don't close it
    // Open corresponding modal based on module ID
    switch (moduleId) {
      case 'price-data':
        setCsvUploadModal({ isOpen: true, stock: sidebarStock });
        break;
      case 'scorecards':
        handleManageScorecards(sidebarStock);
        break;
      case 'rationales':
        handleManageRationales(sidebarStock);
        break;
      case 'performance-pdfs':
        handleManagePdfs(sidebarStock);
        break;
      case 'sector-outlook':
        handleManageSectorOutlook(sidebarStock);
        break;
      case 'sector-insights':
        handleManageSectorInsightsPdfs(sidebarStock);
        break;
      case 'shareholding':
        openShareholdingModal(sidebarStock);
        break;
      case 'news-sections':
        openNewsSectionModal(sidebarStock);
        break;
      case 'faqs':
        openFaqModal(sidebarStock);
        break;
      case 'financial-data':
        setFinancialDataModal({ isOpen: true, stock: sidebarStock });
        break;
    }
  };

  // Close dropdowns when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;
  //     if (!target.closest('.dropdown-container')) {
  //       setDropdownOpen({});
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpdateStockFromModal = async (stockData: StockData) => {
    if (!editingStock) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('company_name', stockData.company_name || '');
      formData.append('teaser', stockData.teaser || '');
      formData.append('short_description', stockData.short_description || '');
      formData.append('analysis', stockData.analysis || '');
      formData.append('demand', stockData.demand || '');
      formData.append('homeDisplay', stockData.homeDisplay || '');
      formData.append('bannerDisplay', stockData.bannerDisplay || '');
      formData.append('valuation_id', stockData.valuation_id?.toString() || '');
      formData.append('price_per_share', stockData.price_per_share?.toString() || '');
      formData.append('price_change', stockData.price_change?.toString() || '');
      formData.append('price_change_period_id', stockData.price_change_period_id?.toString() || '');
      formData.append('percentage_change', stockData.percentage_change?.toString() || '');
      formData.append('founded', stockData.founded?.toString() || '');
      formData.append('sector_ids', JSON.stringify(stockData.sector_ids || []));
      formData.append('subsector_ids', JSON.stringify(stockData.subsector_ids || []));
      formData.append('headquarters', stockData.headquarters || '');
      formData.append('min_units', stockData.min_units?.toString() || '');
      formData.append('lot_size', stockData.lot_size?.toString() || '');
      formData.append('stock_master_ids', JSON.stringify(stockData.stock_master_ids || []));
      
      // Add logo file if selected
      if (stockData.icon) {
        formData.append('logo', stockData.icon);
      }

      const response = await fetch(`/api/admin/stocks/${editingStock.id}`, {
        method: 'PUT',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onRefresh();
        setEditingStock(null);
        onNotification?.('success', 'Stock Updated', 'Stock has been updated successfully!');
      } else {
        onNotification?.('error', 'Update Failed', data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      onNotification?.('error', 'Update Failed', 'An error occurred while updating the stock');
    }
  };

  const handleDelete = (id: number, stockName: string) => {
    setDeleteConfirmation({
        isOpen: true,
      stockId: id,
      stockName: stockName
      });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.stockId) return;
    
    setDeleteLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stocks/${deleteConfirmation.stockId}`, {
          method: 'DELETE',
        headers: {
          'token': token,
        },
      });
        
        const data = await response.json();
        if (data.success) {
          onRefresh();
          onNotification?.('success', 'Stock Deleted', 'Stock has been deleted successfully!');
        setDeleteConfirmation({ isOpen: false, stockId: null, stockName: '' });
        } else {
          onNotification?.('error', 'Delete Failed', data.message || 'Failed to delete stock');
        }
      } catch (error) {
        console.error('Error deleting stock:', error);
        onNotification?.('error', 'Delete Failed', 'Error deleting stock');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Table */}
      <div className="bg-white rounded border border-themeTealLighter">
        {/* Table Container */}
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[800px]">
            <thead className="bg-themeTeal border-b border-themeTealLighter">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('company_name')}
                >
                  <div className="flex items-center">
                    Company
                    {sortBy === 'company_name' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('price_per_share')}
                >
                  <div className="flex items-center">
                    Price per share
                    {sortBy === 'price_per_share' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('valuation')}
                >
                  <div className="flex items-center">
                    Valuation (in Cr.)
                    {sortBy === 'valuation' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('percentage_change')}
                >
                  <div className="flex items-center">
                    % Change
                    {sortBy === 'percentage_change' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('founded')}
                >
                  <div className="flex items-center">
                    Founded
                    {sortBy === 'founded' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-themeTealLighter">
              {stocks.map((stock, index) => (
                <tr 
                  key={stock.id}
                  className={`hover:bg-themeTealWhite transition duration-300 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                  }`}
                >
                  {/* Company Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {stock.logo ? (
                          <Image
                            className="h-8 rounded-full object-cover"
                            src={stock.logo}
                            alt={stock.company_name}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="text-xs font-bold text-white bg-themeTeal p-2 rounded">
                            {stock.company_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-themeTeal font-semibold">
                          {stock.company_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-4 py-3 text-left">
                    <div className="text-xs font-medium text-themeTeal flex items-center"><IndianRupee width={12} height={12}/>{stock.price_per_share}</div>
                  </td>



                  {/* Valuation Column */}
                  <td className="px-4 py-3 text-left">
                    <div className="text-xs font-medium text-gray-900">
                      {stock.valuation || 'N/A'}
                    </div>
                  </td>


                  {/* Percentage Change Column */}
                  <td className="px-4 py-3 text-left">
                    <div className={`text-xs font-medium ${(stock.percentage_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(stock.percentage_change || 0) >= 0 ? '+' : ''}{stock.percentage_change || 0}%
                    </div>
                  </td>

                  {/* Founded Column */}
                  <td className="px-4 py-3 text-left">
                    <div className="text-sm text-themeTeal">{stock.founded || 'N/A'}</div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      {/* View Button - Available for all users */}
                      <button
                        onClick={() => handleViewStock(stock)}
                        className="p-2 text-white bg-themeSkyBlue rounded transition duration-300 hover:bg-white hover:text-themeSkyBlue cursor-pointer"
                        title="View Stock Details"
                      >
                        <Eye width={16} height={16}/>
                      </button>
                      
                      {/* Module Management Sidebar Button - Available for all users */}
                        <button
                        onClick={() => handleOpenSidebar(stock)}
                        className="p-2 text-white bg-themeTeal rounded-lg transition-all duration-200 hover:bg-themeTealLight cursor-pointer shadow-sm hover:shadow-md"
                          title="Manage Stock Modules"
                        >
                          <MoreVertical width={16} height={16}/>
                        </button>
                      
                      {canManageStocks && (
                        <>
                          <button
                            onClick={() => handleEditStock(stock)}
                            className="p-2 bg-themeTeal text-white rounded transition duration-300 hover:bg-white hover:text-themeTeal cursor-pointer"
                            title="Edit Stock"
                          >
                            <SquarePen width={16} height={16}/>
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id, stock.company_name)}
                            className="p-2 bg-red-700 text-white hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer"
                            title="Delete Stock"
                          >
                            <Trash2 width={16} height={16}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Empty State */}
      {stocks.length === 0 && (
        <div className="text-center py-16 min-h-[400px] flex flex-col items-center justify-center">
          <svg className="mx-auto h-16 w-16 text-themeTealLighter mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-themeTeal mb-2">No stocks found</h3>
          <p className="text-sm text-themeTealLighter">Get started by adding a new stock.</p>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <EditStockModal
          stock={editingStock}
          onClose={() => {
                    setEditingStock(null);
                  }}
          onSubmit={handleUpdateStockFromModal}
          stockMasters={stockMasters}
          sectors={sectors}
          subsectors={subsectors}
        />
      )}

      {/* View Stock Modal */}
      {viewingStock && (
        <ViewStockModal
          stock={viewingStock}
          onClose={() => setViewingStock(null)}
          stockMasters={stockMasters}
        />
      )}

      {/* CSV Upload Modal */}
      {csvUploadModal.isOpen && csvUploadModal.stock && (
        <CSVUploadModal
          isOpen={csvUploadModal.isOpen}
          onClose={() => setCsvUploadModal({ isOpen: false, stock: null })}
          stockId={csvUploadModal.stock.id}
          stockName={csvUploadModal.stock.company_name}
          onUploadSuccess={() => {
            onNotification?.('success', 'Success', 'Price data uploaded successfully!');
            onRefresh();
          }}
        />
      )}

      {/* Financial Data Upload Modal */}
      {financialDataModal.isOpen && financialDataModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Upload Financial Data</h2>
                <button
                  onClick={() => setFinancialDataModal({ isOpen: false, stock: null })}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <FinancialDataUpload
                stockId={financialDataModal.stock.id.toString()}
                stockName={financialDataModal.stock.company_name}
                onUploadSuccess={() => {
                  onNotification?.('success', 'Success', 'Financial data uploaded successfully!');
                  setFinancialDataModal({ isOpen: false, stock: null });
                }}
                  />
                </div>
                    </div>
                  </div>
      )}

      {/* Scorecard Management Modal */}
      {scorecardModal.isOpen && scorecardModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Manage Scorecards</h3>
                  <p className="text-white/80 text-sm">{scorecardModal.stock.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setScorecardModal({ isOpen: false, stock: null });
                    setScorecards([]);
                    setEditingScorecard(null);
                    setScorecardFormData({});
                  }}
                  className="text-white transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add New Scorecard Form */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  {editingScorecard ? 'Edit Scorecard' : 'Add New Scorecard'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scorecardFormData.category || ''}
                      onChange={(e) => setScorecardFormData({...scorecardFormData, category: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="e.g., Financial Health, Market Position"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score Value (0-10) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={scorecardFormData.score_value || ''}
                      onChange={(e) => setScorecardFormData({...scorecardFormData, score_value: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="8.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Tag <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={scorecardFormData.score_tag || ''}
                      onChange={(e) => setScorecardFormData({...scorecardFormData, score_tag: e.target.value as 'Low Risk' | 'Medium Risk' | 'High Risk'})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                    >
                      <option value="">Select Risk Level</option>
                      <option value="Low Risk">Low Risk</option>
                      <option value="Medium Risk">Medium Risk</option>
                      <option value="High Risk">High Risk</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Analysis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={scorecardFormData.analysis || ''}
                      onChange={(e) => setScorecardFormData({...scorecardFormData, analysis: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="Detailed analysis of this category..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  {editingScorecard && (
                    <button
                      onClick={() => {
                        setEditingScorecard(null);
                        setScorecardFormData({});
                      }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={editingScorecard ? handleUpdateScorecard : handleCreateScorecard}
                    disabled={!scorecardFormData.category || !scorecardFormData.score_value || !scorecardFormData.score_tag || !scorecardFormData.analysis}
                    className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTeal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingScorecard ? 'Update Scorecard' : 'Add Scorecard'}
                  </button>
                </div>
              </div>

              {/* Existing Scorecards */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Existing Scorecards</h4>
                
                {scorecardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : scorecards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No scorecards found for this stock.</p>
                    <p className="text-sm">Add your first scorecard above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scorecards.map((scorecard) => (
                      <div key={scorecard.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium text-gray-900">{scorecard.category}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                scorecard.score_tag === 'Low Risk' ? 'bg-green-100 text-green-800' :
                                scorecard.score_tag === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {scorecard.score_tag}
                              </span>
                              <span className="text-sm font-medium text-gray-600">
                                {scorecard.score_value}/10
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{scorecard.analysis}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditScorecard(scorecard)}
                              className="p-2 text-themeTeal bg-themeTeal/10 rounded hover:bg-themeTeal/20"
                              title="Edit Scorecard"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteScorecard(scorecard.id)}
                              className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                              title="Delete Scorecard"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Rationale Management Modal */}
      {rationaleModal.isOpen && rationaleModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Manage Investment Rationales</h3>
                  <p className="text-white/80 text-sm">{rationaleModal.stock.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setRationaleModal({ isOpen: false, stock: null });
                    setRationales({ pros: [], risks: [] });
                    setEditingRationale(null);
                    setRationaleFormData({});
                  }}
                  className="text-white transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add New Investment Rationale Form */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  {editingRationale ? 'Edit Investment Rationale' : 'Add New Investment Rationale'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rationaleFormData.type || ''}
                      onChange={(e) => setRationaleFormData({...rationaleFormData, type: e.target.value as 'pros' | 'risks'})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="pros">Pros (Investment Rationale)</option>
                      <option value="risks">Risks (Key Risks)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Index
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rationaleFormData.order_index || ''}
                      onChange={(e) => setRationaleFormData({...rationaleFormData, order_index: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rationaleFormData.title || ''}
                      onChange={(e) => setRationaleFormData({...rationaleFormData, title: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="e.g., Strong Fundamentals, Market Volatility"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={rationaleFormData.description || ''}
                      onChange={(e) => setRationaleFormData({...rationaleFormData, description: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="Detailed description of this rationale..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setRationaleIconFile(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-themeTeal file:text-white hover:file:bg-themeTeal/80"
                      />
                      {rationaleFormData.icon && (
                        <div className="flex items-center space-x-2">
                          <Image 
                            src={rationaleFormData.icon} 
                            alt="Current icon" 
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm text-gray-500">Current icon</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload an icon for this rationale (optional)</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  {editingRationale && (
                    <button
                      onClick={() => {
                        setEditingRationale(null);
                        setRationaleFormData({});
                      }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={editingRationale ? handleUpdateRationale : handleCreateRationale}
                    disabled={!rationaleFormData.type || !rationaleFormData.title || !rationaleFormData.description}
                    className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTeal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingRationale ? 'Update Rationale' : 'Add Rationale'}
                  </button>
                </div>
              </div>

              {/* Existing Investment Rationales */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Existing Investment Rationales</h4>
                
                {rationaleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : (rationales.pros.length === 0 && rationales.risks.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No investment rationales found for this stock.</p>
                    <p className="text-sm">Add your first rationale above.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Pros Section */}
                    {rationales.pros.length > 0 && (
                      <div>
                        <h5 className="text-md font-medium text-green-700 mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Investment Rationale ({rationales.pros.length})
                        </h5>
                        <div className="space-y-3">
                          {rationales.pros.map((rationale) => (
                            <div key={rationale.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    {rationale.icon && (
                                      <Image 
                                        src={rationale.icon} 
                                        alt={`${rationale.title} icon`}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 rounded object-cover"
                                      />
                                    )}
                                    <h6 className="font-medium text-gray-900">{rationale.title}</h6>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                      PROS
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Order: {rationale.order_index}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{rationale.description}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEditRationale(rationale)}
                                    className="p-2 text-themeTeal bg-themeTeal/10 rounded hover:bg-themeTeal/20"
                                    title="Edit Rationale"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRationale(rationale.id)}
                                    className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                    title="Delete Rationale"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risks Section */}
                    {rationales.risks.length > 0 && (
                      <div>
                        <h5 className="text-md font-medium text-red-700 mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Key Risks ({rationales.risks.length})
                        </h5>
                        <div className="space-y-3">
                          {rationales.risks.map((rationale) => (
                            <div key={rationale.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    {rationale.icon && (
                                      <Image 
                                        src={rationale.icon} 
                                        alt={`${rationale.title} icon`}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 rounded object-cover"
                                      />
                                    )}
                                    <h6 className="font-medium text-gray-900">{rationale.title}</h6>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                      RISKS
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Order: {rationale.order_index}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{rationale.description}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEditRationale(rationale)}
                                    className="p-2 text-themeTeal bg-themeTeal/10 rounded hover:bg-themeTeal/20"
                                    title="Edit Rationale"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRationale(rationale.id)}
                                    className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                    title="Delete Rationale"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance PDF Management Modal */}
      {pdfModal.isOpen && pdfModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Manage Performance PDFs</h3>
                  <p className="text-white/80 text-sm">{pdfModal.stock.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setPdfModal({ isOpen: false, stock: null });
                    setPdfs([]);
                    setEditingPdf(null);
                    setPdfFormData({});
                    setPdfFile(null);
                  }}
                  className="text-white transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Upload New PDF Form */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  {editingPdf ? 'Edit Performance PDF' : 'Upload New Performance PDF'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pdfFormData.title || ''}
                      onChange={(e) => setPdfFormData({...pdfFormData, title: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="e.g., Q3 2024 Performance Report"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Index
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pdfFormData.order_index || ''}
                      onChange={(e) => setPdfFormData({...pdfFormData, order_index: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={pdfFormData.description || ''}
                      onChange={(e) => setPdfFormData({...pdfFormData, description: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="Brief description of this PDF document..."
                    />
                  </div>
                  
                  {!editingPdf && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PDF File <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                    </div>
                  )}
                  
                  {editingPdf && (
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={pdfFormData.is_active || false}
                          onChange={(e) => setPdfFormData({...pdfFormData, is_active: e.target.checked})}
                          className="rounded border-gray-300 text-themeTeal focus:ring-themeTeal"
                        />
                        <span className="text-sm text-gray-700">Active (visible to users)</span>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  {editingPdf && (
                    <button
                      onClick={() => {
                        setEditingPdf(null);
                        setPdfFormData({});
                      }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={editingPdf ? handleUpdatePdf : handleCreatePdf}
                    disabled={!pdfFormData.title || (!editingPdf && !pdfFile)}
                    className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTeal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingPdf ? 'Update PDF' : 'Upload PDF'}
                  </button>
                </div>
              </div>

              {/* Existing PDFs */}
              <div>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Existing Performance PDFs</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    All PDFs are shown below. Only one PDF can be active at a time. 
                    Click &quot;✓ Set Active&quot; to switch which PDF is displayed on the frontend.
                  </p>
                </div>
                
                {pdfLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : pdfs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No performance PDFs found for this stock.</p>
                    <p className="text-sm">Upload your first PDF above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pdfs.map((pdf) => (
                      <div key={pdf.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium text-gray-900">{pdf.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pdf.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {pdf.is_active ? '✓ ACTIVE' : '✗ INACTIVE'}
                              </span>
                              <span className="text-sm text-gray-500">
                                Order: {pdf.order_index}
                              </span>
                            </div>
                            {pdf.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{pdf.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{pdf.file_name}</span>
                              <span>{formatFileSize(pdf.file_size)}</span>
                              <span>{pdf.page_count} pages</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!pdf.is_active && (
                              <button
                                onClick={() => handleSetActivePdf(pdf.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium shadow-sm"
                                title="Set as Active PDF"
                              >
                                ✓ Set Active
                              </button>
                            )}
                            <a
                              href={pdf.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                              title="View PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => {
                                setReplacingPdf(pdf);
                                setPdfFile(null);
                              }}
                              className="p-2 text-orange-600 bg-orange-50 rounded hover:bg-orange-100"
                              title="Replace PDF File"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPdf(pdf)}
                              className="p-2 text-themeTeal bg-themeTeal/10 rounded hover:bg-themeTeal/20"
                              title="Edit PDF"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePdf(pdf.id)}
                              className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                              title="Delete PDF"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace PDF Modal */}
      {replacingPdf && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-md mx-4 my-4">
            {/* Modal Header */}
            <div className="bg-orange-500 px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Replace PDF File</h3>
                  <p className="text-white/80 text-sm">{replacingPdf.title}</p>
                </div>
                <button
                  onClick={() => {
                    setReplacingPdf(null);
                    setPdfFile(null);
                  }}
                  className="text-white transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {pdfFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReplacingPdf(null);
                    setPdfFile(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplacePdf}
                  disabled={!pdfFile}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Replace PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sector Outlook Management Modal */}
      {sectorOutlookModal.isOpen && sectorOutlookModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Manage Sector Outlook</h3>
                  <p className="text-themeTealWhite text-sm">{sectorOutlookModal.stock.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setSectorOutlookModal({ isOpen: false, stock: null });
                    setSectorOutlook(null);
                    setSectorOutlookFormData({ description: '', accordions: [] });
                  }}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {sectorOutlookLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector Outlook Description
                    </label>
                    <textarea
                      value={sectorOutlookFormData.description}
                      onChange={(e) => setSectorOutlookFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="Enter sector outlook description..."
                    />
                  </div>

                  {/* Accordion Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Accordion Items</h4>
                      <button
                        onClick={addAccordionItem}
                        className="px-3 py-1 bg-themeTeal text-white rounded text-sm hover:bg-themeTealLight"
                      >
                        Add Item
                      </button>
                    </div>

                    {sectorOutlookFormData.accordions.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                          <button
                            onClick={() => removeAccordionItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateAccordionItem(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                              placeholder="Enter accordion title..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Analysis
                            </label>
                            <textarea
                              value={item.analysis}
                              onChange={(e) => updateAccordionItem(index, 'analysis', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                              placeholder="Enter analysis content..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {sectorOutlookFormData.accordions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No accordion items added yet. Click &quot;Add Item&quot; to start.</p>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSectorOutlook}
                      className="px-6 py-2 bg-themeTeal text-white rounded-md hover:bg-themeTealLight"
                    >
                      Save Sector Outlook
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sector Insights PDF Management Modal */}
      {sectorInsightsPdfModal.isOpen && sectorInsightsPdfModal.stock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Manage Sector Insights PDFs</h3>
                  <p className="text-themeTealWhite text-sm">{sectorInsightsPdfModal.stock.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setSectorInsightsPdfModal({ isOpen: false, stock: null });
                    setSectorInsightsPdfs([]);
                    setEditingSectorInsightsPdf(null);
                    setSectorInsightsPdfFormData({});
                    setSectorInsightsPdfFile(null);
                  }}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {sectorInsightsPdfLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="space-y-6">
                {/* Upload New PDF */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    {editingSectorInsightsPdf ? 'Edit Sector Insights PDF' : 'Upload New Sector Insights PDF'}
                  </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sectorInsightsPdfFormData.title || ''}
                          onChange={(e) => setSectorInsightsPdfFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          placeholder="e.g., Q3 2024 Sector Insights Report"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order Index
                        </label>
                        <input
                          type="number"
                          value={sectorInsightsPdfFormData.order_index || 0}
                          onChange={(e) => setSectorInsightsPdfFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={sectorInsightsPdfFormData.description || ''}
                          onChange={(e) => setSectorInsightsPdfFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          placeholder="Brief description of this PDF document..."
                        />
                      </div>
                      
                      {!editingSectorInsightsPdf && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PDF File <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSectorInsightsPdfFile(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                        </div>
                      )}
                      
                      {editingSectorInsightsPdf && (
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={sectorInsightsPdfFormData.is_active || false}
                              onChange={(e) => setSectorInsightsPdfFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                              className="rounded border-gray-300 text-themeTeal focus:ring-themeTeal"
                            />
                            <span className="text-sm text-gray-700">Active (visible to users)</span>
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      {editingSectorInsightsPdf && (
                        <button
                          onClick={() => {
                            setEditingSectorInsightsPdf(null);
                            setSectorInsightsPdfFormData({});
                          }}
                          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={editingSectorInsightsPdf ? handleUpdateSectorInsightsPdf : handleUploadSectorInsightsPdf}
                        disabled={!sectorInsightsPdfFormData.title || (!editingSectorInsightsPdf && !sectorInsightsPdfFile)}
                        className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTealLight disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingSectorInsightsPdf ? 'Update PDF' : 'Upload PDF'}
                      </button>
                    </div>
                  </div>

                  {/* Existing PDFs */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Existing Sector Insights PDFs</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        All PDFs are shown below. Only one PDF can be active at a time. 
                        Click &quot;✓ Set Active&quot; to switch which PDF is displayed on the frontend.
                      </p>
                    </div>
                    
                    {sectorInsightsPdfs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No sector insights PDFs uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sectorInsightsPdfs.map((pdf) => (
                          <div key={pdf.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h5 className="font-medium text-gray-900">{pdf.title}</h5>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    pdf.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                                  }`}>
                                    {pdf.is_active ? '✓ ACTIVE' : '✗ INACTIVE'}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Order: {pdf.order_index}
                                  </span>
                                </div>
                                {pdf.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{pdf.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{pdf.file_name}</span>
                                  <span>{formatFileSize(pdf.file_size)}</span>
                                  <span>{pdf.page_count} pages</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {!pdf.is_active && (
                                  <button
                                    onClick={() => handleSetActiveSectorInsightsPdf(pdf.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium shadow-sm"
                                    title="Set as Active PDF"
                                  >
                                    ✓ Set Active
                                  </button>
                                )}
                                <a
                                  href={pdf.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                  title="View PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => {
                                    setReplacingSectorInsightsPdf(pdf);
                                    setSectorInsightsPdfFile(null);
                                  }}
                                  className="p-2 text-orange-600 bg-orange-50 rounded hover:bg-orange-100"
                                  title="Replace PDF File"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditSectorInsightsPdf(pdf)}
                                  className="p-2 text-themeTeal bg-themeTeal/10 rounded hover:bg-themeTeal/20"
                                  title="Edit PDF"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSectorInsightsPdf(pdf.id)}
                                  className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                  title="Delete PDF"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Replace Sector Insights PDF Modal */}
      {replacingSectorInsightsPdf && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded shadow w-full max-w-md mx-4 my-4">
            {/* Modal Header */}
            <div className="bg-orange-500 px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Replace PDF File</h3>
                  <p className="text-white/80 text-sm">{replacingSectorInsightsPdf.title}</p>
                </div>
                <button
                  onClick={() => {
                    setReplacingSectorInsightsPdf(null);
                    setSectorInsightsPdfFile(null);
                  }}
                  className="text-white transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSectorInsightsPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {sectorInsightsPdfFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {sectorInsightsPdfFile.name} ({(sectorInsightsPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReplacingSectorInsightsPdf(null);
                    setSectorInsightsPdfFile(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplaceSectorInsightsPdf}
                  disabled={!sectorInsightsPdfFile}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Replace PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, stockId: null, stockName: '' })}
        onConfirm={confirmDelete}
        title="Delete Stock"
        message={`Are you sure you want to delete "${deleteConfirmation.stockName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Scorecard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={scorecardDeleteConfirmation.isOpen}
        onClose={() => setScorecardDeleteConfirmation({ isOpen: false, scorecardId: null })}
        onConfirm={confirmDeleteScorecard}
        title="Delete Scorecard"
        message="Are you sure you want to delete this scorecard? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Investment Rationale Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={rationaleDeleteConfirmation.isOpen}
        onClose={() => setRationaleDeleteConfirmation({ isOpen: false, rationaleId: null })}
        onConfirm={confirmDeleteRationale}
        title="Delete Investment Rationale"
        message="Are you sure you want to delete this investment rationale? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Performance PDF Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={pdfDeleteConfirmation.isOpen}
        onClose={() => setPdfDeleteConfirmation({ isOpen: false, pdfId: null })}
        onConfirm={confirmDeletePdf}
        title="Delete Performance PDF"
        message="Are you sure you want to delete this performance PDF? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Sector Insights PDF Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={sectorInsightsPdfDeleteConfirmation.isOpen}
        onClose={() => setSectorInsightsPdfDeleteConfirmation({ isOpen: false, pdfId: null })}
        onConfirm={confirmDeleteSectorInsightsPdf}
        title="Delete Sector Insights PDF"
        message="Are you sure you want to delete this sector insights PDF? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Shareholding Management Modal */}
      {shareholdingModal.isOpen && shareholdingModal.stock && (
        <ShareholdingManagement
          stockId={shareholdingModal.stock.id.toString()}
          stockName={shareholdingModal.stock.company_name}
          onClose={closeShareholdingModal}
        />
      )}

        {/* News Section Management Modal */}
        {newsSectionModal.isOpen && newsSectionModal.stock && (
          <NewsSectionManagement
            stockId={newsSectionModal.stock.id.toString()}
            stockName={newsSectionModal.stock.company_name}
            onClose={closeNewsSectionModal}
          />
        )}

        {/* FAQ Management Modal */}
        {faqModal.isOpen && faqModal.stock && (
          <FaqManagement
            stockId={faqModal.stock.id.toString()}
            stockName={faqModal.stock.company_name}
            onClose={closeFaqModal}
          />
        )}

      {/* Stock Modules Sidebar */}
      <StockModulesSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        stock={sidebarStock}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
};

export default StockTable;
