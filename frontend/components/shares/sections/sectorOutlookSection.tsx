"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface SectorOutlookSectionProps {
  stockId?: number;
}

interface AccordionItem {
  id: number;
  title: string;
  analysis: string;
  order_index: number;
}

interface SectorOutlook {
  id: number;
  stock_id: number;
  description: string;
  accordions: AccordionItem[];
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

export default function SectorOutlookSection({ stockId }: SectorOutlookSectionProps) {
  const [sectorOutlook, setSectorOutlook] = useState<SectorOutlook | null>(null);
  const [activePdf, setActivePdf] = useState<SectorInsightsPdf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    console.log('SectorOutlookSection useEffect - stockId:', stockId);
    if (stockId) {
      const fetchData = async () => {
        try {
          console.log('Starting to fetch sector outlook data...');
          await Promise.all([fetchSectorOutlook(), fetchActivePdf()]);
          console.log('Finished fetching sector outlook data');
        } catch (error) {
          console.error('Error fetching sector outlook data:', error);
          setError('Failed to load sector outlook data');
        } finally {
          console.log('Setting loading to false');
          setLoading(false);
        }
      };
      fetchData();
    } else {
      console.log('No stockId provided, setting loading to false');
      setLoading(false);
    }
  }, [stockId]);

  // Auto-slideshow every 5 seconds
  useEffect(() => {
    if (!isAutoPlay || !activePdf || !numPages) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => {
        if (prev >= numPages) {
          return 1; // Loop back to first page
        }
        return prev + 1;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, activePdf, numPages]);

  const fetchSectorOutlook = async () => {
    try {
      console.log('Fetching sector outlook for stockId:', stockId);
      const response = await fetch(`/api/stocks/${stockId}/sector-outlooks`);
      const data = await response.json();
      
      console.log('Sector outlook response:', data);
      
      if (data.success && data.data) {
        setSectorOutlook(data.data);
      } else {
        console.log('No sector outlook data found');
      }
    } catch (error) {
      console.error('Error fetching sector outlook:', error);
      setError('Failed to load sector outlook');
    }
  };

  const fetchActivePdf = async () => {
    try {
      console.log('Fetching sector insights PDF for stockId:', stockId);
      const response = await fetch(`/api/stocks/${stockId}/sector-insights-pdfs`);
      const data = await response.json();
      
      console.log('Sector insights PDF response:', data);
      
      if (data.success && data.data.pdfs && data.data.pdfs.length > 0) {
        const activePdf = data.data.pdfs.find((pdf: SectorInsightsPdf) => pdf.is_active);
        if (activePdf) {
          setActivePdf(activePdf);
          console.log('Active PDF found:', activePdf);
        } else {
          console.log('No active PDF found');
        }
      } else {
        console.log('No sector insights PDFs found');
      }
    } catch (error) {
      console.error('Error fetching sector insights PDF:', error);
      setError('Failed to load sector insights PDF');
    }
  };

  const toggleAccordion = (id: number) => {
    const newExpanded = new Set(expandedAccordions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAccordions(newExpanded);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
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

  if (!stockId) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500 py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No stock ID provided.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sector Outlook Content */}
      {sectorOutlook && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Description */}
          {sectorOutlook.description && (
            <div className="mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">{sectorOutlook.description}</p>
            </div>
          )}

          {/* Accordion Items */}
          {sectorOutlook.accordions && sectorOutlook.accordions.length > 0 && (
            <div className="space-y-4">
              {sectorOutlook.accordions
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-sm text-gray-900">{item.title}</span>
                    {expandedAccordions.has(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedAccordions.has(item.id) && (
                    <div className="px-4 pb-4">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-700 text-sm leading-relaxed">{item.analysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!sectorOutlook.description && (!sectorOutlook.accordions || sectorOutlook.accordions.length === 0)) && (
            <div className="text-center text-gray-500 py-8">
              <p>No sector outlook information available.</p>
            </div>
          )}
        </div>
      )}

      {/* Sector Insights PDF */}
      {activePdf && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sector and Market Insights for sophisticated investors</h3>
          </div>

          {/* PDF Viewer with Side Controls */}
          <div className="flex justify-center items-center mb-6">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="flex items-center justify-center w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mr-4"
              title="Previous Page"
            >
              <ChevronLeft className="w-8 h-8 text-gray-400 hover:text-themeTeal" />
            </button>

            {/* PDF Viewer */}
            <div className="relative">
              <PDFViewer
                pdfUrl={activePdf.pdf_url}
                currentPage={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              className="flex items-center justify-center w-12 h-12 transition-all duration-200 ml-4"
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
      )}

      {!sectorOutlook && !activePdf && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No sector outlook information available.</p>
          </div>
        </div>
      )}
    </div>
  );
}