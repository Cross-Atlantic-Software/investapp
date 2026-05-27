"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface PerformancePdfData {
  id: number;
  title: string;
  description?: string;
  pdf_url: string;
  file_name: string;
  file_size: number;
  page_count: number;
  order_index: number;
  is_active: boolean;
}

interface PerformanceBenchmarkSectionProps {
  stockId?: number;
}

export default function PerformanceBenchmarkSection({ stockId }: PerformanceBenchmarkSectionProps) {
  const [activePdf, setActivePdf] = useState<PerformancePdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivePdf = async () => {
      if (!stockId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${stockId}/performance-pdfs`);
        const data = await response.json();
        
        if (data.success) {
          // Find the active PDF
          const activePdf = data.data.pdfs.find((pdf: PerformancePdfData) => pdf.is_active);
          setActivePdf(activePdf || null);
        } else {
          setError(data.message || 'Failed to fetch Competitive Benchmarking PDF');
        }
      } catch (err) {
        setError('Failed to fetch Competitive Benchmarking PDF');
        console.error('Error fetching Competitive Benchmarking PDF:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePdf();
  }, [stockId]);


  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentPage(1);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Cleanup: restore body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document. Please check if the file exists and is accessible.');
  };

  const goToPreviousPage = () => {
    if (numPages) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Loop back to last page
        setCurrentPage(numPages);
      }
    }
  };

  const goToNextPage = () => {
    if (numPages) {
      if (currentPage < numPages) {
        setCurrentPage(currentPage + 1);
      } else {
        // Loop back to first page
        setCurrentPage(1);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!activePdf) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No active performance document available for this stock.</p>
        <p className="text-sm text-gray-400 mt-1">Administrators can upload and activate documents.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-6">
          <FileText className="w-16 h-16 mx-auto mb-4 text-themeTeal" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{activePdf.title || 'Performance Benchmark'}</h3>
          {activePdf.description && (
            <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{activePdf.description}</p>
          )}
          <button
            onClick={openModal}
            className="px-6 py-3 bg-themeTeal text-white rounded-lg hover:bg-themeTealDark transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            View Performance Document
          </button>
        </div>
      </div>

      {/* Modal - 90% width with blur background */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative w-[90vw] h-[90vh] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all duration-200"
              title="Close (Esc)"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* PDF Viewer Container - Full width of modal */}
            <div 
              className="flex-1 flex items-start justify-center overflow-auto bg-gray-50 px-4 pb-4 pt-0" 
              data-pdf-container
            >
              <PDFViewer
                pdfUrl={activePdf.pdf_url}
                currentPage={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
            </div>

            {/* Navigation Controls - Fixed at Bottom */}
            <div className="flex justify-center items-center gap-4 p-4 bg-white border-t border-gray-200" data-pdf-nav>
              <button
                onClick={goToPreviousPage}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 hover:border-themeTeal transition-all duration-200"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-themeTeal" />
              </button>
              
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                Page {currentPage} of {numPages || '...'}
              </span>
              
              <button
                onClick={goToNextPage}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 hover:border-themeTeal transition-all duration-200"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 hover:text-themeTeal" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
