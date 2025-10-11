import React, { useEffect, useState, useRef } from 'react';
import ImageUpload from '../ImageUpload';
import GenericSearchableMultiSelect from '@/components/admin/shared/GenericSearchableMultiSelect';
import { StepProps, ImageUploadState } from '../types';

interface Step1Props extends StepProps {
  imageUpload: ImageUploadState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
}

const Step1: React.FC<Step1Props> = ({
  formData,
  onInputChange,
  onFormDataChange,
  imageUpload,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onRemoveImage,
  sectors = [],
  subsectors = [],
}) => {
  const [availableSubsectors, setAvailableSubsectors] = useState<Array<{id: number; name: string; sector_id: number}>>([]);
  const isUpdatingRef = useRef(false);

  // Update available subsectors when selected sectors change
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    if (formData.sector_ids.length > 0) {
      const filteredSubsectors = subsectors.filter(sub => 
        formData.sector_ids.includes(sub.sector_id)
      );
      setAvailableSubsectors(filteredSubsectors);
      
      // Remove subsectors that are no longer valid for selected sectors
      const validSubsectorIds = filteredSubsectors.map(sub => sub.id);
      const updatedSubsectorIds = formData.subsector_ids.filter(id => 
        validSubsectorIds.includes(id)
      );
      
      if (updatedSubsectorIds.length !== formData.subsector_ids.length) {
        isUpdatingRef.current = true;
        onFormDataChange({ subsector_ids: updatedSubsectorIds });
        setTimeout(() => { isUpdatingRef.current = false; }, 0);
      }
    } else {
      setAvailableSubsectors([]);
      // Only clear subsector_ids if they're not already empty
      if (formData.subsector_ids.length > 0) {
        isUpdatingRef.current = true;
        onFormDataChange({ subsector_ids: [] });
        setTimeout(() => { isUpdatingRef.current = false; }, 0);
      }
    }
  }, [formData.sector_ids, subsectors, formData.subsector_ids]);
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-themeTeal">Basic Company Information</h4>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
          placeholder="Enter company name"
        />
      </div>
      
      {/* Company Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Founded Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="founded"
            value={formData.founded}
            onChange={onInputChange}
            required
            min="1800"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="2023"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Headquarters <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="headquarters"
            value={formData.headquarters}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      {/* Sectors */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Sectors <span className="text-red-500">*</span>
        </label>
        <GenericSearchableMultiSelect
          options={sectors.map(sector => ({ value: sector.id, label: sector.name }))}
          selectedValues={formData.sector_ids}
          onChange={(values) => onFormDataChange({ sector_ids: values })}
          placeholder="Select sectors..."
          forceAbove={true}
        />
      </div>

      {/* Subsectors */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Subsectors <span className="text-red-500">*</span>
        </label>
        <GenericSearchableMultiSelect
          options={availableSubsectors.map(subsector => ({ value: subsector.id, label: subsector.name }))}
          selectedValues={formData.subsector_ids}
          onChange={(values) => onFormDataChange({ subsector_ids: values })}
          placeholder={formData.sector_ids.length > 0 ? "Select subsectors..." : "Select sectors first..."}
          forceAbove={true}
          disabled={formData.sector_ids.length === 0}
        />
        {formData.sector_ids.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Please select sectors first to choose subsectors</p>
        )}
      </div>
      
      {/* Stock Icon */}
      <ImageUpload
        imageUpload={imageUpload}
        onFileChange={onFileChange}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onRemoveImage={onRemoveImage}
      />
    </div>
  );
};

export default Step1;
