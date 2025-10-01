import React from 'react';
import { StepProps } from '../types';

const Step5: React.FC<StepProps & { stockMasters?: Array<{ id: number; name: string; }> }> = ({ 
  formData, 
  stockMasters = [] 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-themeTeal mb-2">Review & Submit</h4>
        <p className="text-sm text-gray-600">Review all information before submitting</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Company:</span>
            <p className="text-gray-600">{formData.company_name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Founded:</span>
            <p className="text-gray-600">{formData.founded}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Sector:</span>
            <p className="text-gray-600">{formData.sector}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Subsector:</span>
            <p className="text-gray-600">{formData.subsector}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Headquarters:</span>
            <p className="text-gray-600">{formData.headquarters}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Valuation:</span>
            <p className="text-gray-600">₹{formData.valuation}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Price per Share:</span>
            <p className="text-gray-600">₹{formData.price_per_share}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Percentage Change:</span>
            <p className="text-gray-600">{formData.percentage_change}%</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Demand:</span>
            <p className="text-gray-600">{formData.demand}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Home Display:</span>
            <p className="text-gray-600">{formData.homeDisplay}</p>
          </div>
        </div>
        
        {formData.teaser && (
          <div>
            <span className="font-medium text-gray-700">Teaser:</span>
            <p className="text-gray-600">{formData.teaser}</p>
          </div>
        )}
        
        {formData.stock_master_ids.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Tags:</span>
            <p className="text-gray-600">
              {formData.stock_master_ids.map(id => 
                stockMasters.find(master => master.id === id)?.name
              ).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5;
