"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PDF components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div></div>
});

const Page = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), {
  ssr: false
});

interface PDFViewerProps {
  pdfUrl: string;
  currentPage: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}

export default function PDFViewer({ pdfUrl, currentPage, onLoadSuccess, onLoadError }: PDFViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
    
    // Configure PDF.js worker only on client side
    if (typeof window !== 'undefined') {
      import('react-pdf').then(({ pdfjs }) => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });

      // Calculate container width - use full width of modal container
      const updateWidth = () => {
        const container = document.querySelector('[data-pdf-container]');
        if (container) {
          const rect = container.getBoundingClientRect();
          // Use full width of container minus padding (p-4 = 16px on each side = 32px total)
          const availableWidth = rect.width - 32;
          // Use the full available width for maximum readability
          setContainerWidth(availableWidth);
        } else {
          // Fallback: use 90% of viewport minus padding
          const availableWidth = (window.innerWidth * 0.9) - 200;
          setContainerWidth(Math.max(400, availableWidth));
        }
      };

      setTimeout(updateWidth, 100);
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [currentPage]); // Recalculate when page changes

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
          <p className="text-gray-500">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-start w-full h-full min-w-0 min-h-0" 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="flex items-center justify-center h-96 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
          </div>
        }
      >
        {containerWidth && (
          <div className="flex justify-center">
            <Page
              pageNumber={currentPage}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-2xl"
              width={containerWidth}
            />
          </div>
        )}
      </Document>
    </div>
  );
}
