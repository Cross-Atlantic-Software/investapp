import React from 'react';
import ImageUpload from '../ImageUpload';
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
  imageUpload,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onRemoveImage,
}) => {
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
            Sector <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="Technology"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-themeTeal mb-1">
            Subsector <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subsector"
            value={formData.subsector}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
            placeholder="Software"
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
