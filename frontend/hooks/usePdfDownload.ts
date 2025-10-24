import { useCallback } from 'react';

interface PdfDownloadOptions {
  filename?: string;
  includeDate?: boolean;
}

export const usePdfDownload = () => {
  const downloadAsPdf = useCallback(async (elementId: string, options: PdfDownloadOptions = {}) => {
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Add date stamp to the element temporarily
      const dateStamp = document.createElement('div');
      dateStamp.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        z-index: 9999;
        pointer-events: none;
      `;
      dateStamp.textContent = `Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;

      // Append date stamp to body temporarily
      document.body.appendChild(dateStamp);

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: false, // Changed to false to prevent CORS issues
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false, // Disable logging to reduce console errors
        onclone: (clonedDoc) => {
          // Handle broken images and CORS issues in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            // Add crossOrigin attribute to handle CORS
            img.crossOrigin = 'anonymous';
            
            img.onerror = () => {
              console.log(`Image failed to load: ${img.src}`);
              // Replace broken images with a placeholder
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
              img.alt = 'Image failed to load';
            };
            
            // Preload images to catch errors early
            const testImg = new Image();
            testImg.crossOrigin = 'anonymous';
            testImg.onerror = () => {
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
              img.alt = 'Image failed to load';
            };
            testImg.src = img.src;
          });
        },
      });

      // Remove the temporary date stamp
      document.body.removeChild(dateStamp);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add date stamp to PDF
      if (options.includeDate !== false) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Generated on: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          pdfWidth - 10,
          pdfHeight - 10,
          { align: 'right' }
        );
      }

      // Generate filename
      const defaultFilename = `portfolio-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
      const filename = options.filename || defaultFilename;

      // Download the PDF
      pdf.save(filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }, []);

  return { downloadAsPdf };
};
