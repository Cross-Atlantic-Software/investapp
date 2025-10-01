import React from 'react';
import SimpleRichTextEditor from '../../SimpleRichTextEditor';
import { StepProps } from '../types';

const Step3: React.FC<StepProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-themeTeal mb-2">Content & Description</h4>
        <p className="text-sm text-gray-600">Add detailed content about the stock</p>
      </div>
      
      {/* Teaser */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Teaser
        </label>
        <textarea
          name="teaser"
          value={formData.teaser}
          onChange={(e) => onFormDataChange({ teaser: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
          placeholder="Enter teaser text"
          rows={3}
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Short Description
        </label>
        <SimpleRichTextEditor
          value={formData.short_description}
          onChange={(value) => onFormDataChange({ short_description: value })}
          placeholder="Enter short description"
          height="120px"
        />
      </div>

      {/* Analysis */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Analysis
        </label>
        <SimpleRichTextEditor
          value={formData.analysis}
          onChange={(value) => onFormDataChange({ analysis: value })}
          placeholder="Enter detailed analysis..."
          height="200px"
        />
      </div>
    </div>
  );
};

export default Step3;
