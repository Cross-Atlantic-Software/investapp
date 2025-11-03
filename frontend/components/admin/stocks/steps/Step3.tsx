'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { StepProps } from '../types';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const Step3: React.FC<StepProps> = ({ formData, onFormDataChange }) => {
  // Configure Quill modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link'
  ];

  const handleShortDescriptionChange = (value: string) => {
    onFormDataChange({ short_description: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-themeTeal">Content & Description</h4>
      </div>
      
      {/* Teaser */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Teaser <span className="text-red-500">*</span>
        </label>
        <textarea
          name="teaser"
          value={formData.teaser}
          onChange={(e) => onFormDataChange({ teaser: e.target.value })}
          required
          className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
          placeholder="Enter teaser text"
          rows={3}
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Short Description <span className="text-red-500">*</span>
        </label>
        <div className="border border-themeTealLighter rounded-md">
          <ReactQuill
            theme="snow"
            value={formData.short_description || ''}
            onChange={handleShortDescriptionChange}
            modules={modules}
            formats={formats}
            placeholder="Enter short description"
            style={{ height: '150px', marginBottom: '42px' }}
            className="react-quill-custom"
          />
        </div>
        <style jsx global>{`
          .react-quill-custom .ql-container {
            min-height: 150px;
            font-size: 14px;
            color: #4B5563;
          }
          .react-quill-custom .ql-editor {
            min-height: 150px;
          }
          .react-quill-custom .ql-toolbar {
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 1px solid #E5E7EB;
            background-color: #F9FAFB;
          }
          .react-quill-custom .ql-container {
            border-bottom: none;
            border-left: none;
            border-right: none;
            border-top: none;
          }
        `}</style>
      </div>

      {/* Analysis */}
      {/* <div>
        <label className="block text-xs font-medium text-themeTeal mb-1">
          Analysis <span className="text-red-500">*</span>
        </label>
        <SimpleRichTextEditor
          value={formData.analysis}
          onChange={(value) => onFormDataChange({ analysis: value })}
          placeholder="Enter detailed analysis..."
          height="200px"
        />
      </div> */}
    </div>
  );
};

export default Step3;
