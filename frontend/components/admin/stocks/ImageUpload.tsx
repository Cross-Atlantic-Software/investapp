import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageUploadProps } from './types';

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUpload,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onRemoveImage,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-themeTeal mb-1">
        Stock Icon <span className="text-red-500">*</span>
      </label>
      
      {/* Error Message */}
      {imageUpload.error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{imageUpload.error}</p>
        </div>
      )}
      
      {/* Upload Area */}
      <label 
        htmlFor="icon-upload"
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-themeTealLighter rounded transition-colors duration-200 cursor-pointer ${
          imageUpload.error 
            ? 'border-red-300 bg-red-50' 
            : imageUpload.preview 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-themeTealLighter hover:bg-themeTealWhite'
        }`}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {imageUpload.preview ? (
          /* Image Preview */
          <div className="space-y-3 text-center">
            <div className="relative inline-block">
              <Image
                src={imageUpload.preview}
                alt="Preview"
                width={80}
                height={80}
                className="h-20 w-20 object-cover rounded border border-themeTealLighter mx-auto"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
              >
                <X/>
              </button>
            </div>
            <div className="text-sm text-themeTealLighter">
              <p className="font-medium text-green-600 mb-2">✓ Image selected</p>
              <p className="text-xs text-themeTealLighter">{imageUpload.file?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('icon-upload')?.click()}
              className="bg-themeTeal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-themeTealLight transition-colors duration-200 cursor-pointer"
            >
              Change Image
            </button>
          </div>
        ) : (
          /* Upload Prompt */
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <span className="bg-white rounded-md font-medium text-themeTeal px-2 py-1">Upload a file</span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </label>
      
      {/* Hidden File Input */}
      <input
        id="icon-upload"
        name="icon"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="sr-only"
      />
    </div>
  );
};

export default ImageUpload;
