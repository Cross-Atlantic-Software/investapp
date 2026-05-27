'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, AlertCircle } from 'lucide-react';

interface ReportData {
  hasReport: boolean;
  filename?: string;
  s3Url?: string;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReport();
  }, []);

  const fetchUserReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      
      console.log('🔐 Frontend: Auth token found:', token ? 'Yes' : 'No');
      console.log('🔐 Frontend: Token length:', token.length);
      
      if (!token) {
        console.log('❌ Frontend: No auth token found');
        alert('Please log in to view your reports');
        return;
      }
      
      const response = await fetch('/api/user-report', {
        headers: {
          'token': token,
        },
      });
      
      console.log('📡 Frontend: API response status:', response.status);
      const data = await response.json();
      console.log('📡 Frontend: API response data:', data);
      
      if (data.success) {
        setReportData(data.data);
      } else {
        console.log('❌ Frontend: API returned error:', data.message);
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching user report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (reportData?.s3Url) {
      try {
        // Fetch the PDF file
        const response = await fetch(reportData.s3Url);
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from URL or use a default name
        const filename = reportData.filename || 'my-report.pdf';
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report');
      }
    }
  };

  const handleView = () => {
    if (reportData?.s3Url) {
      window.open(reportData.s3Url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-themeTeal"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="mt-2 text-gray-600">
            View and download your investment reports
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {reportData?.hasReport ? (
            <div className="p-8">
              {/* Report Found */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Your Report is Ready
                </h2>
                <p className="text-gray-600">
                  You can view or download your investment report below
                </p>
              </div>

              {/* Report Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-themeTeal" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {reportData.filename || 'Investment Report'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        PDF Document
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Available Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleView}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-themeTeal text-white rounded-lg hover:bg-themeTealDark transition-colors duration-200 font-medium"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Report</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Report Information</p>
                    <p>
                      Your investment report contains detailed analysis and recommendations. 
                      You can view it online or download it for offline reference.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              {/* No Report Found */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Report Available
              </h2>
              <p className="text-gray-600 mb-8">
                Your investment report is not ready yet. Please check back later or contact support if you have any questions.
              </p>
              
              {/* Contact Support Button */}
              <button
                onClick={() => window.location.href = '/contact'}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-themeTeal text-white rounded-lg hover:bg-themeTealDark transition-colors duration-200 font-medium"
              >
                <span>Contact Support</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Reports are generated based on your investment portfolio and market analysis.
            <br />
            For any questions about your report, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
