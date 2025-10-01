import React from 'react';
import GenericSearchableMultiSelect from '@/components/admin/shared/GenericSearchableMultiSelect';
import { StepProps } from '../types';

const Step4: React.FC<StepProps> = ({ formData, onInputChange, onFormDataChange, stockMasters = [] }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-themeTeal mb-2">Display Settings & Tags</h4>
        <p className="text-sm text-gray-600">Configure how the stock will be displayed</p>
      </div>
      
      {/* Demand */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Demand
        </label>
        <select
          name="demand"
          value={formData.demand}
          onChange={onInputChange}
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
            Home Display
          </label>
          <select
            name="homeDisplay"
            value={formData.homeDisplay}
            onChange={onInputChange}
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Banner Display
          </label>
          <select
            name="bannerDisplay"
            value={formData.bannerDisplay}
            onChange={onInputChange}
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
          Stock Tags
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
