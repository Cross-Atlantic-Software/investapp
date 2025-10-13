'use client';

import { Building, Mail, Phone, User, X } from 'lucide-react';
import React from 'react';

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface EnquiryModalProps {
  enquiry: Enquiry;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const EnquiryModal: React.FC<EnquiryModalProps> = ({
  enquiry,
  onClose,
  onUpdateStatus
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      read: { color: 'bg-yellow-100 text-yellow-800', label: 'Read' },
      replied: { color: 'bg-green-100 text-green-800', label: 'Replied' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(enquiry.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 m-0">
      <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-themeTealWhite">
                  {enquiry.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-themeTealWhite">Enquiry Details</h3>
                <p className="text-sm text-themeTealLighter">ID: #{enquiry.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(enquiry.status)}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
              >
                <X width={26} height={26}/>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Contact Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-themeTeal mb-4">Contact Information</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <User className='text-themeTealLight'/>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-themeTeal">Name</div>
                      <div className="text-sm text-themeTealLight">{enquiry.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Mail className='text-themeTealLight'/>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-themeTeal">Email</div>
                      <div className="text-sm text-themeTealLight">
                        <a href={`mailto:${enquiry.email}`} className="text-themeTeal hover:text-themeTealLight transition duration-300">
                          {enquiry.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {enquiry.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Phone className='text-themeTealLight'/>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-themeTeal">Phone</div>
                        <div className="text-sm text-themeTealLight">
                          <a href={`tel:${enquiry.phone}`} className="text-themeTeal hover:text-themeTealLight transition duration-300">
                            {enquiry.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {enquiry.company && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Building className='text-themeTealLight'/>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-themeTeal">Company</div>
                        <div className="text-sm text-themeTealLight">{enquiry.company}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-themeTeal mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-themeTeal">Enquiry Submitted</div>
                      <div className="text-sm text-themeTealLight">{formatDate(enquiry.createdAt)}</div>
                    </div>
                  </div>
                  {enquiry.updatedAt !== enquiry.createdAt && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-themeTeal">Last Updated</div>
                        <div className="text-sm text-themeTealLight">{formatDate(enquiry.updatedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Message and Actions */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-themeTeal mb-4">Enquiry Details</h4>
                
                {enquiry.subject && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-themeTeal mb-2">Subject</div>
                    <div className="text-sm text-themeTealLight bg-themeTealWhite p-3 rounded">
                      {enquiry.subject}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-themeTeal mb-2">Message</div>
                  <div className="text-sm text-themeTealLight bg-themeTealWhite p-4 rounded whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {enquiry.message}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-themeTeal mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-themeTeal mb-2">
                      Update Status
                    </label>
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-themeTealWhite flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm bg-themeTeal text-themeTealWhite rounded hover:bg-themeTealLight transition-colors duration-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
