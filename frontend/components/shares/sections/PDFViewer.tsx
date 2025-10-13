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

  useEffect(() => {
    setIsClient(true);
    
    // Configure PDF.js worker only on client side
    if (typeof window !== 'undefined') {
      import('react-pdf').then(({ pdfjs }) => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });
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
      <Page
        pageNumber={currentPage}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="shadow-lg"
      />
    </Document>
  );
}
