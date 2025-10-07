import React from 'react';
import { StepProps } from '../types';

const Step2: React.FC<StepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-themeTeal">Financial Details</h4>
      </div>
      
      {/* Valuation */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Valuation <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="valuation"
          value={formData.valuation}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
          placeholder="0.00"
          step="0.01"
        />
      </div>
      
      {/* Price Change */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Price Change <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price_change"
          value={formData.price_change}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200 text-gray-900"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      {/* Percentage Change and Price per Share - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Percentage Change <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">%</span>
            </div>
            <input
              type="number"
              name="percentage_change"
              value={formData.percentage_change}
              onChange={onInputChange}
              className="w-full pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price per Share <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">₹</span>
            </div>
            <input
              type="number"
              name="price_per_share"
              value={formData.price_per_share}
              onChange={onInputChange}
              required
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Min Units <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="min_units"
            value={formData.min_units}
            onChange={onInputChange}
            required
            min="1"
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="1"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Lot Size <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="lot_size"
            value={formData.lot_size}
            onChange={onInputChange}
            required
            min="1"
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="1"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;
