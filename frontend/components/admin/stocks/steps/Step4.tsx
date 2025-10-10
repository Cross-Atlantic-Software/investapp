import React from 'react';
import GenericSearchableMultiSelect from '@/components/admin/shared/GenericSearchableMultiSelect';
import { StepProps } from '../types';

const Step4: React.FC<StepProps> = ({ formData, onInputChange, onFormDataChange, stockMasters = [] }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-themeTeal">Display Settings & Tags</h4>
      </div>
      
      {/* Demand */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Stock Demand Tag - High / Low <span className="text-red-500">*</span>
        </label>
        <select
          name="demand"
          value={formData.demand}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
        >
          <option value="High Demand">High Demand</option>
          <option value="Low Demand">Low Demand</option>
        </select>
      </div>

      {/* Display Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            What&apos;s going on Today <span className="text-red-500">*</span>
          </label>
          <select
            name="homeDisplay"
            value={formData.homeDisplay}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Home Page - Top Banner Slider <span className="text-red-500">*</span>
          </label>
          <select
            name="bannerDisplay"
            value={formData.bannerDisplay}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      {/* Stock Tags */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Stock Tags <span className="text-red-500">*</span>
        </label>
        <GenericSearchableMultiSelect
          options={stockMasters.map(master => ({ value: master.id, label: master.name }))}
          selectedValues={formData.stock_master_ids}
          onChange={(values) => onFormDataChange({ stock_master_ids: values })}
          placeholder="Select stock tags..."
          forceAbove={true}
        />
      </div>
    </div>
  );
};

export default Step4;
