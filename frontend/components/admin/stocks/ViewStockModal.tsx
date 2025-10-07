'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import StepProgressIndicator from './StepProgressIndicator';

interface Stock {
  id: number;
  company_name: string;
  logo: string;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  founded: number;
  sector: string;
  subsector: string;
  headquarters: string;
  min_units: number;
  lot_size: number;
  stock_master_ids: number[];
  stock_masters?: Array<{
    id: number;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ViewStockModalProps {
  stock: Stock;
  onClose: () => void;
  stockMasters?: Array<{
    id: number;
    name: string;
  }>;
}

const ViewStockModal: React.FC<ViewStockModalProps> = ({ stock, onClose, stockMasters = [] }) => {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);

  const getStockMasterNames = () => {
    if (!Array.isArray(stock.stock_master_ids)) {
      return 'No tags assigned';
    }
    return stock.stock_master_ids.map(id => 
      stockMasters.find(master => master.id === id)?.name
    ).filter(Boolean).join(', ') || 'No tags assigned';
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-themeTeal">Basic Company Information</h4>
            </div>

            {/* Company Name and ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Company Name</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.company_name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Stock ID</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.id}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Founded Year</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.founded || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Headquarters</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.headquarters || 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Sector</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.sector || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Subsector</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.subsector || 'N/A'}
                </div>
              </div>
            </div>

            {/* Company Logo */}
            {stock.logo && (
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Company Logo</label>
                <div className="mt-1 border-2 border-themeTealLighter border-dashed rounded p-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Image
                        src={stock.logo}
                        alt={`${stock.company_name} logo`}
                        width={120}
                        height={120}
                        className="h-30 w-30 rounded-lg object-cover shadow-sm shadow-themeTeal/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-themeTeal">Financial Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Price per Share</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700 font-semibold">
                  ₹{stock.price_per_share || 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Valuation</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.valuation || 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Price Change</label>
                <div className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md font-semibold ${
                  (stock.price_change || 0) >= 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {(stock.price_change || 0) >= 0 ? '+' : ''}₹{Math.abs(stock.price_change || 0)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Percentage Change</label>
                <div className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md font-semibold ${
                  (stock.percentage_change || 0) >= 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {(stock.percentage_change || 0) >= 0 ? '+' : ''}{stock.percentage_change || 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Minimum Units</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.min_units || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Lot Size</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {stock.lot_size || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-themeTeal">Content & Description</h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">Teaser</label>
              <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700 min-h-[60px]">
                {stock.teaser || 'No teaser available'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">Short Description</label>
              <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700 min-h-[80px]">
                {stock.short_description || 'No short description available'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">Analysis</label>
              <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700 min-h-[120px] whitespace-pre-wrap">
                {stock.analysis || 'No analysis available'}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-themeTeal">Display Settings & Tags</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Demand</label>
                <div className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md font-semibold ${
                  stock.demand === 'High Demand' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {stock.demand || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Home Display</label>
                <div className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md ${
                  stock.homeDisplay === 'yes' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-50 text-gray-700'
                }`}>
                  {stock.homeDisplay === 'yes' ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Banner Display</label>
                <div className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md ${
                  stock.bannerDisplay === 'yes' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-50 text-gray-700'
                }`}>
                  {stock.bannerDisplay === 'yes' ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">Stock Tags</label>
              <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700 min-h-[60px]">
                {getStockMasterNames()}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-themeTeal">System Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Created At</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {new Date(stock.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Last Updated</label>
                <div className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md bg-gray-50 text-gray-700">
                  {new Date(stock.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-themeTealWhite border border-themeTealLighter rounded-lg p-4">
              <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
                <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
                Stock Summary
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <p className="text-gray-600">{stock.company_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sector:</span>
                  <p className="text-gray-600">{stock.sector}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <p className="text-gray-600">₹{stock.price_per_share}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Demand:</span>
                  <p className={stock.demand === 'High Demand' ? 'text-green-600' : 'text-red-600'}>
                    {stock.demand}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 m-0">
      <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Stock Details</h3>
              <p className="text-xs text-themeTealWhite mt-1">Step {currentStep} of {totalSteps} • {stock.company_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X width={20} height={20}/>
            </button>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <StepProgressIndicator
          totalSteps={totalSteps}
          currentStep={currentStep}
          isStepCompleted={() => true} // All steps are accessible in view mode
          validateStep={() => true}
          goToStep={handleGoToStep}
        />

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
          
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="px-4 py-2 text-sm bg-themeTeal text-white rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStockModal;
