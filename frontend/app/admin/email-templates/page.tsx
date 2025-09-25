'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader, NotificationContainer, NotificationData } from '@/components/admin/shared';

interface EmailTemplate {
  id: number;
  type: string;
  subject: string;
  body: string;
  created_by: number;
  updated_by: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    body: ''
  });

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchTemplates = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        sort_by: 'createdAt',
        sort_order: 'DESC'
      });

      const response = await fetch(`/api/admin/email-templates?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching email templates:', data.message);
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to fetch email templates',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch email templates',
        duration: 5000
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [search]);

  // Separate search function that never touches loading states
  const searchTemplates = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        search: search,
        sort_by: 'createdAt',
        sort_order: 'DESC'
      });

      const response = await fetch(`/api/admin/email-templates?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates);
        setPagination(data.data.pagination);
      } else {
        console.error('Error searching email templates:', data.message);
      }
    } catch (error) {
      console.error('Error searching email templates:', error);
    }
  }, [search]);

  useEffect(() => {
    fetchTemplates();
  }, []); // Only run once on mount

  // Debounced search effect
  useEffect(() => {
    if (search) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      searchTemplates(); // Use dedicated search function that never touches loading states
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [search, searchTemplates]); // Include searchTemplates in dependencies

  const handlePageChange = (page: number) => {
    fetchTemplates(page);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      type: '',
      subject: '',
      body: ''
    });
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      type: template.type,
      subject: template.subject,
      body: template.body
    });
    setIsModalOpen(true);
  };

  const loadTemplate = (templateType: string) => {
    const templates = {
      verification: {
        type: 'Email_Verification',
        subject: 'Verify Your Email - Invest App',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff !important; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff !important; min-height: 100vh; }
        .header { background-color: #232f3e; padding: 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px; }
        .content { padding: 50px 30px; background-color: #ffffff !important; text-align: center; flex: 1; }
        .main-heading { font-size: 26px; font-weight: 600; color: #000000 !important; margin: 0 0 25px 0; text-align: center; }
        .intro-text { font-size: 17px; color: #333333 !important; margin: 0 0 40px 0; line-height: 1.7; text-align: center; max-width: 500px; margin-left: auto; margin-right: auto; }
        .verification-section { margin: 40px 0; text-align: center; }
        .verification-label { font-size: 20px; font-weight: 600; color: #000000 !important; margin: 0 0 15px 0; text-align: center; }
        .verification-code { font-size: 42px; font-weight: 700; color: #000000 !important; margin: 0 0 15px 0; letter-spacing: 3px; text-align: center; }
        .validity-note { font-size: 15px; color: #666666 !important; margin: 0; text-align: center; }
        .footer { background-color: #f8f9fa !important; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; margin-top: auto; }
        .footer p { margin: 0; color: #6c757d !important; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invest App</h1>
        </div>
        <div class="content">
            <h1 class="main-heading">Verify your email address</h1>
            <p class="intro-text">
                Thanks for starting the new InvestApp account creation process. We want to make sure it's really you. Please enter the following verification code when prompted. If you don't want to create an account, you can ignore this message.
            </p>
            <div class="verification-section">
                <div class="verification-label">Verification code</div>
                <div class="verification-code">{{otpCode}}</div>
                <div class="validity-note">(This code is valid for 10 minutes)</div>
            </div>
            <div class="footer">
                <p>If you didn't request this verification, please ignore this email.<br>© 2025 InvestApp. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`
      },
      buy_confirmation: {
        type: 'Buy_Order_Success',
        subject: 'Buy Order Confirmation - Investment Successful',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buy Confirmation - Invest App</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff !important; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff !important; min-height: 100vh; }
        .header { background-color: #232f3e; padding: 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px; }
        .content { padding: 50px 30px; background-color: #ffffff !important; text-align: center; flex: 1; }
        .main-heading { font-size: 26px; font-weight: 600; color: #000000 !important; margin: 0 0 25px 0; text-align: center; }
        .intro-text { font-size: 17px; color: #333333 !important; margin: 0 0 40px 0; line-height: 1.7; text-align: center; max-width: 500px; margin-left: auto; margin-right: auto; }
        .confirmation-section { margin: 40px 0; text-align: center; }
        .confirmation-label { font-size: 20px; font-weight: 600; color: #000000 !important; margin: 0 0 15px 0; text-align: center; }
        .confirmation-message { font-size: 18px; font-weight: 500; color: #28a745 !important; margin: 0 0 20px 0; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
        .transaction-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
        .detail-row:last-child { margin-bottom: 0; font-weight: bold; color: #28a745; border-top: 1px solid #e9ecef; padding-top: 10px; margin-top: 10px; }
        .detail-label { font-weight: 600; color: #333333; font-size: 14px; }
        .detail-value { color: #666666; font-size: 14px; }
        .footer { background-color: #f8f9fa !important; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; margin-top: auto; }
        .footer p { margin: 0; color: #6c757d !important; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invest App</h1>
        </div>
        <div class="content">
            <h1 class="main-heading">Buy Order Confirmed</h1>
            <p class="intro-text">Your buy order has been successfully placed. Here are the details of your transaction:</p>
            <div class="confirmation-section">
                <div class="confirmation-label">Transaction Details</div>
                <div class="confirmation-message">Buy Order Successfully Placed</div>
            </div>
            <div class="transaction-details">
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">{{companyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">{{quantity}} shares</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price per Share:</span>
                    <span class="detail-value">₹{{price}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹{{totalAmount}}</span>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for using Invest App!<br>© 2025 InvestApp. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`
      },
      sell_confirmation: {
        type: 'Sell_Order_Success',
        subject: 'Sell Order Confirmation - Sale Completed',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sell Confirmation - Invest App</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff !important; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff !important; min-height: 100vh; }
        .header { background-color: #232f3e; padding: 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px; }
        .content { padding: 50px 30px; background-color: #ffffff !important; text-align: center; flex: 1; }
        .main-heading { font-size: 26px; font-weight: 600; color: #000000 !important; margin: 0 0 25px 0; text-align: center; }
        .intro-text { font-size: 17px; color: #333333 !important; margin: 0 0 40px 0; line-height: 1.7; text-align: center; max-width: 500px; margin-left: auto; margin-right: auto; }
        .confirmation-section { margin: 40px 0; text-align: center; }
        .confirmation-label { font-size: 20px; font-weight: 600; color: #000000 !important; margin: 0 0 15px 0; text-align: center; }
        .confirmation-message { font-size: 18px; font-weight: 500; color: #28a745 !important; margin: 0 0 20px 0; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
        .transaction-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
        .detail-row:last-child { margin-bottom: 0; font-weight: bold; color: #28a745; border-top: 1px solid #e9ecef; padding-top: 10px; margin-top: 10px; }
        .detail-label { font-weight: 600; color: #333333; font-size: 14px; }
        .detail-value { color: #666666; font-size: 14px; }
        .footer { background-color: #f8f9fa !important; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; margin-top: auto; }
        .footer p { margin: 0; color: #6c757d !important; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invest App</h1>
        </div>
        <div class="content">
            <h1 class="main-heading">Sell Order Confirmed</h1>
            <p class="intro-text">Your sell order has been successfully placed. Here are the details of your transaction:</p>
            <div class="confirmation-section">
                <div class="confirmation-label">Transaction Details</div>
                <div class="confirmation-message">Sell Order Successfully Placed</div>
            </div>
            <div class="transaction-details">
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">{{companyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">{{quantity}} shares</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Selling Price per Share:</span>
                    <span class="detail-value">₹{{sellingPrice}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹{{totalAmount}}</span>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for using Invest App!<br>© 2025 InvestApp. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`
      },
      admin_notification: {
        type: 'Admin_Purchase_Notification',
        subject: 'New Stock Purchase Notification - Admin Alert',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Stock Purchase - Invest App</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff !important; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff !important; min-height: 100vh; }
        .header { background-color: #232f3e; padding: 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px; }
        .content { padding: 50px 30px; background-color: #ffffff !important; text-align: center; flex: 1; }
        .main-heading { font-size: 26px; font-weight: 600; color: #000000 !important; margin: 0 0 25px 0; text-align: center; }
        .intro-text { font-size: 17px; color: #333333 !important; margin: 0 0 40px 0; line-height: 1.7; text-align: center; max-width: 500px; margin-left: auto; margin-right: auto; }
        .notification-section { margin: 40px 0; text-align: center; }
        .notification-label { font-size: 20px; font-weight: 600; color: #000000 !important; margin: 0 0 15px 0; text-align: center; }
        .notification-message { font-size: 18px; font-weight: 500; color: #28a745 !important; margin: 0 0 20px 0; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
        .transaction-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
        .detail-row:last-child { margin-bottom: 0; font-weight: bold; color: #28a745; border-top: 1px solid #e9ecef; padding-top: 10px; margin-top: 10px; }
        .detail-label { font-weight: 600; color: #333333; font-size: 14px; }
        .detail-value { color: #666666; font-size: 14px; }
        .user-info { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
        .user-info h3 { color: #000000; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; }
        .footer { background-color: #f8f9fa !important; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; margin-top: auto; }
        .footer p { margin: 0; color: #6c757d !important; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invest App</h1>
        </div>
        <div class="content">
            <h1 class="main-heading">New Stock Purchase Notification</h1>
            <p class="intro-text">{{userName}} has completed a stock purchase transaction on the platform. Please review the transaction details below:</p>
            <div class="notification-section">
                <div class="notification-label">Transaction Summary</div>
                <div class="notification-message">New stock purchase completed successfully</div>
            </div>
            <div class="user-info">
                <h3>User Information</h3>
                <div class="detail-row">
                    <span class="detail-label">User Email:</span>
                    <span class="detail-value">{{userEmail}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User Name:</span>
                    <span class="detail-value">{{userName}}</span>
                </div>
            </div>
            <div class="transaction-details">
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">{{companyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">{{quantity}} shares</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price per Share:</span>
                    <span class="detail-value">₹{{price}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹{{totalAmount}}</span>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated notification from Invest App.<br>Please log into the admin panel to view more details and manage this transaction.</p>
            </div>
        </div>
    </div>
</body>
</html>`
      }
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setFormData({
        type: template.type,
        subject: template.subject,
        body: template.body
      });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const url = editingTemplate 
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : '/api/admin/email-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: editingTemplate ? 'Email template updated successfully' : 'Email template created successfully',
          duration: 5000
        });
        setIsModalOpen(false);
        fetchTemplates(pagination.currentPage);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to save email template',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save email template',
        duration: 5000
      });
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this email template?')) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Email template deleted successfully',
          duration: 5000
        });
        fetchTemplates(pagination.currentPage);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete email template',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting email template:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete email template',
        duration: 5000
      });
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 overflow-x-hidden relative">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading email templates..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Email Template Manager</h1>
            <p className="text-sm text-themeTealLight">Manage email templates for different types of notifications.</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All templates <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{pagination.totalCount}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by type or subject"
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                />
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-themeTeal animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <button
                onClick={handleAddTemplate}
                className="bg-themeTeal text-white px-4 py-2 text-sm rounded-lg hover:bg-themeTealLight transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Template
              </button>
            </div>
          </div>

          {/* Templates Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{template.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{template.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(template.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit Template"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Template"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-themeTeal border-themeTeal text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-themeTeal to-themeTealLight px-6 py-4 flex-shrink-0 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {editingTemplate ? 'Edit Email Template' : 'Add Email Template'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              <form id="email-template-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Buy_Order_Success, Sell_Order_Success, Contact_Us"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Email subject line"
                    />
                  </div>
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Body (HTML) <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Template Selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quick Templates:</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadTemplate('verification')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Email Verification
                      </button>
                      <button
                        type="button"
                        onClick={() => loadTemplate('buy_confirmation')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Buy Confirmation
                      </button>
                      <button
                        type="button"
                        onClick={() => loadTemplate('sell_confirmation')}
                        className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        Sell Confirmation
                      </button>
                      <button
                        type="button"
                        onClick={() => loadTemplate('admin_notification')}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Admin Notification
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200 font-mono text-sm"
                    placeholder="Email body content (HTML format). Use variables like {{otpCode}}, {{companyName}}, {{quantity}}, {{price}}, {{totalAmount}}, {{userName}}, {{userEmail}}"
                    rows={12}
                  />
                  
                  {/* Variable Helper */}
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">Available Variables:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><code className="bg-white px-1 rounded">{'{{otpCode}}'}</code> - Verification code</div>
                      <div><code className="bg-white px-1 rounded">{'{{email}}'}</code> - User email</div>
                      <div><code className="bg-white px-1 rounded">{'{{companyName}}'}</code> - Company name</div>
                      <div><code className="bg-white px-1 rounded">{'{{quantity}}'}</code> - Number of shares</div>
                      <div><code className="bg-white px-1 rounded">{'{{price}}'}</code> - Price per share</div>
                      <div><code className="bg-white px-1 rounded">{'{{totalAmount}}'}</code> - Total amount</div>
                      <div><code className="bg-white px-1 rounded">{'{{userName}}'}</code> - User name</div>
                      <div><code className="bg-white px-1 rounded">{'{{userEmail}}'}</code> - User email</div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0 rounded-b-2xl">
              <button
                type="submit"
                form="email-template-form"
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors duration-200 font-medium"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
