import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { StepProps, ImageUploadState } from '../types';

interface PriceChangePeriod {
  id: number;
  period: string;
}

const Step5: React.FC<StepProps & { 
  stockMasters?: Array<{ id: number; name: string; }>;
  sectors?: Array<{ id: number; name: string; }>;
  subsectors?: Array<{ id: number; name: string; sector_id: number; }>;
  imageUpload: ImageUploadState;
}> = ({ 
  formData, 
  stockMasters = [],
  sectors = [],
  subsectors = [],
  imageUpload
}) => {
  const [priceChangePeriods, setPriceChangePeriods] = useState<PriceChangePeriod[]>([]);

  useEffect(() => {
    const fetchPriceChangePeriods = async () => {
      try {
        const response = await fetch('/api/admin/price-change-periods/select');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data?.periods) {
            setPriceChangePeriods(data.data.periods);
          }
        }
      } catch (error) {
        console.error('Error fetching price change periods:', error);
      }
    };

    fetchPriceChangePeriods();
  }, []);
  const getStockMasterNames = () => {
    if (!Array.isArray(formData.stock_master_ids)) {
      return 'No tags selected';
    }
    return formData.stock_master_ids.map(id => 
      stockMasters.find(master => master.id === id)?.name
    ).filter(Boolean).join(', ');
  };

  const getSectorNames = () => {
    if (!Array.isArray(formData.sector_ids)) {
      return 'No sectors selected';
    }
    return formData.sector_ids.map(id => 
      sectors.find(sector => sector.id === id)?.name
    ).filter(Boolean).join(', ');
  };

  const getSubsectorNames = () => {
    if (!Array.isArray(formData.subsector_ids)) {
      return 'No subsectors selected';
    }
    return formData.subsector_ids.map(id => 
      subsectors.find(subsector => subsector.id === id)?.name
    ).filter(Boolean).join(', ');
  };

  // Memoize the price change period name to ensure it updates when dependencies change
  const priceChangePeriodName = useMemo(() => {
    if (!formData.price_change_period_id) return '12 Months';
    
    const period = priceChangePeriods.find(p => p.id === formData.price_change_period_id);
    return period ? period.period : '12 Months';
  }, [formData.price_change_period_id, priceChangePeriods]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-themeTeal">Review & Submit</h4>
        <p className="text-sm text-gray-600 mt-1">Please review all information before submitting</p>
      </div>
      
      <div className="space-y-6">
        {/* Basic Company Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
            <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
            Basic Company Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Company Name:</span>
              <p className="text-gray-600 mt-1">{formData.company_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Founded Year:</span>
              <p className="text-gray-600 mt-1">{formData.founded}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Sectors:</span>
              <p className="text-gray-600 mt-1">{getSectorNames()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Subsectors:</span>
              <p className="text-gray-600 mt-1">{getSubsectorNames()}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Headquarters:</span>
              <p className="text-gray-600 mt-1">{formData.headquarters}</p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
            <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
          Stock Price Details
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Valuation:</span>
              <p className="text-gray-600 mt-1">₹{formData.valuation}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Price per Share:</span>
              <p className="text-gray-600 mt-1">₹{formData.price_per_share}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Price Change:</span>
              <p className="text-gray-600 mt-1">₹{formData.price_change}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Price Change Period:</span>
              <p className="text-gray-600 mt-1">{priceChangePeriodName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Percentage Change:</span>
              <p className="text-gray-600 mt-1">{formData.percentage_change}%</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Minimum Units:</span>
              <p className="text-gray-600 mt-1">{formData.min_units}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lot Size:</span>
              <p className="text-gray-600 mt-1">{formData.lot_size}</p>
            </div>
          </div>
        </div>

        {/* Content & Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
            <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
            Content & Description
          </h5>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Teaser:</span>
              <p className="text-gray-600 mt-1">{formData.teaser || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Short Description:</span>
              <div className="text-gray-600 mt-1 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formData.short_description || 'Not provided' }} />
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Analysis:</span>
              <div className="text-gray-600 mt-1 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formData.analysis || 'Not provided' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings & Tags */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
            <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
            Display Settings & Tags
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Stock Demand Tag :</span>
              <p className="text-gray-600 mt-1">{formData.demand}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">What&apos;s going on Today:</span>
              <p className="text-gray-600 mt-1 capitalize">{formData.homeDisplay}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Home Page - Top Banner Slider:</span>
              <p className="text-gray-600 mt-1 capitalize">{formData.bannerDisplay}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Stock Tags:</span>
              <p className="text-gray-600 mt-1">{getStockMasterNames() || 'No tags selected'}</p>
            </div>
          </div>
        </div>

        {/* Company Logo */}
        {imageUpload.preview && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="text-md font-semibold text-themeTeal mb-3 flex items-center">
              <div className="w-2 h-2 bg-themeTeal rounded-full mr-2"></div>
              Company Logo
            </h5>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Logo Preview:</span>
              <div className="mt-2 flex items-center space-x-4">
                <div className="relative">
                  <Image
                    src={imageUpload.preview}
                    alt="Company Logo Preview"
                    width={80}
                    height={80}
                    className="rounded-lg border border-gray-200 object-cover"
                  />
                </div>
                <div>
                  <p className="text-green-600 font-medium">✓ Logo uploaded successfully</p>
                  <p className="text-gray-500 text-xs">
                    {imageUpload.file?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5;
