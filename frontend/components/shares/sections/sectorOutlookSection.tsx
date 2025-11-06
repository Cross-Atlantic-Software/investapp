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
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    console.log('SectorOutlookSection useEffect - stockId:', stockId);
    if (stockId) {
      const fetchData = async () => {
        try {
          console.log('Starting to fetch Sector & Comapany outlook data...');
          await Promise.all([fetchSectorOutlook(), fetchActivePdf()]);
          console.log('Finished fetching Sector & Comapany outlook data');
        } catch (error) {
          console.error('Error fetching Sector & Comapany outlook data:', error);
          setError('Failed to load Sector & Comapany outlook data');
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
      console.log('Fetching Sector & Comapany outlook for stockId:', stockId);
      const response = await fetch(`/api/stocks/${stockId}/sector-outlooks`);
      const data = await response.json();
      
      console.log('Sector & Comapany outlook response:', data);
      
      if (data.success && data.data) {
        setSectorOutlook(data.data);
      } else {
        console.log('No Sector & Comapany outlook data found');
      }
    } catch (error) {
      console.error('Error fetching Sector & Comapany outlook:', error);
      setError('Failed to load Sector & Comapany outlook');
    }
  };

  const fetchActivePdf = async () => {
    try {
      console.log('Fetching Sector & Comapany insights PDF for stockId:', stockId);
      const response = await fetch(`/api/stocks/${stockId}/sector-insights-pdfs`);
      const data = await response.json();
      
      console.log('Sector & Comapany insights PDF response:', data);
      
      if (data.success && data.data.pdfs && data.data.pdfs.length > 0) {
        const activePdf = data.data.pdfs.find((pdf: SectorInsightsPdf) => pdf.is_active);
        if (activePdf) {
          setActivePdf(activePdf);
          console.log('Active PDF found:', activePdf);
        } else {
          console.log('No active PDF found');
        }
      } else {
        console.log('No sector & Company insights PDFs found');
      }
    } catch (error) {
      console.error('Error fetching Sector & Comapany insights PDF:', error);
      setError('Failed to load Sector & Comapany insights PDF');
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
      {/* Sector & Comapany outlook Content */}
      {sectorOutlook && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Description */}
          {sectorOutlook.description && (
            <div className="mb-6">
              <div 
                className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={{ __html: sectorOutlook.description }}
              />
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
                        <div 
                          className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-ul:text-gray-700 prose-ol:text-gray-700"
                          dangerouslySetInnerHTML={{ __html: item.analysis }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!sectorOutlook.description && (!sectorOutlook.accordions || sectorOutlook.accordions.length === 0)) && (
            <div className="text-center text-gray-500 py-8">
              <p>No Sector & Comapany outlook information available.</p>
            </div>
          )}
        </div>
      )}

      {/* Sector & Comapany insights PDF */}
      {activePdf && (
        <div className="bg-white border border-gray-200 rounded-lg py-6">
          {/* <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sector and Market Insights for sophisticated investors</h3>
          </div> */}

          {/* PDF Viewer */}
          <div className="w-full mb-4 overflow-x-auto" data-pdf-container>
            <div className="flex justify-center min-w-0">
              <PDFViewer
                pdfUrl={activePdf.pdf_url}
                currentPage={currentPage}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
            </div>
          </div>

          {/* Navigation Controls - Below PDF */}
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={goToPreviousPage}
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 hover:border-themeTeal transition-all duration-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700 hover:text-themeTeal" />
            </button>
            
            <span className="text-sm text-gray-500">Page {currentPage} of {numPages || '...'}</span>
            
            <button
              onClick={goToNextPage}
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 hover:border-themeTeal transition-all duration-200"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-gray-700 hover:text-themeTeal" />
            </button>
          </div>

        </div>
      )}

      {!sectorOutlook && !activePdf && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No Sector & Comapany outlook information available.</p>
          </div>
        </div>
      )}
    </div>
  );
}