"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
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
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document. Please check if the file exists and is accessible.');
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    } else {
      // Loop back to first page
      setCurrentPage(1);
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 overflow-hidden">
      {/* PDF Viewer with Side Controls */}
      <div className="flex justify-center items-center mb-6 gap-4">
        {/* Previous Button */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-12 h-12 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Previous Page"
        >
          <ChevronLeft className="w-8 h-8 text-gray-400 hover:text-themeTeal" />
        </button>

        {/* PDF Viewer Container */}
        <div className="relative flex-1 max-w-full overflow-hidden" data-pdf-container>
          <div className="w-full max-w-full overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
            {activePdf ? (
              <PDFViewer
                pdfUrl={activePdf.pdf_url}
                currentPage={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
            ) : (
              <div className="flex items-center justify-center h-96 w-full bg-gray-100 rounded-lg min-w-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading PDF viewer...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={goToNextPage}
          disabled={numPages ? currentPage >= numPages : false}
          className="flex items-center justify-center w-12 h-12 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Next Page"
        >
          <ChevronRight className="w-8 h-8 text-gray-400 hover:text-themeTeal" />
        </button>
      </div>

      {/* Page indicator at bottom */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500">Page {currentPage} of {numPages || '...'}</span>
      </div>
    </div>
  );
}
