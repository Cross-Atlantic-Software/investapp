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

      // Calculate container width based on available space
      const updateWidth = () => {
        const container = document.querySelector('[data-pdf-container]');
        if (container) {
          const rect = container.getBoundingClientRect();
          // Use full container width minus padding (32px on each side = 64px total)
          setContainerWidth(Math.max(300, rect.width - 64));
        } else {
          // Fallback: use window width minus padding for buttons and margins
          setContainerWidth(Math.min(1200, Math.max(300, window.innerWidth - 200)));
        }
      };

      // Small delay to ensure DOM is ready
      setTimeout(updateWidth, 100);
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

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
    <div className="flex justify-center items-center p-4 w-full min-w-0">
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
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg max-w-full"
            width={containerWidth}
          />
        )}
      </Document>
    </div>
  );
}
