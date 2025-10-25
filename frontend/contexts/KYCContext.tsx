'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface KYCFormData {
  // Step 2: PAN Validation
  pan_number: string;
  name_pan: string;
  dob: string;
  father_name: string;
  residency_status: 'Indian' | 'NRI';
  pan_file: File | null;
  
  // Step 3: Address Verification
  aadhar_number: string;
  aadhar_file: File | null;
  
  // Step 4: Bank Proof
  account_number: string;
  ifsc_code: string;
  bank_proof_file: File | null;
  
  // Step 5: Demat Account
  demat_type: string;
  demat_account_id: string;
  demat_file: File | null;
  
  // Step 6: Video KYC (completed flag)
  video_kyc_completed: boolean;
  
  // Step 7: eSign (signature file)
  signature_file: File | null;
  esign_completed: boolean;
}

interface KYCContextType {
  formData: KYCFormData;
  updateFormData: (updates: Partial<KYCFormData>) => void;
  resetFormData: () => void;
  submitKYC: () => Promise<{ success: boolean; message: string }>;
  isSubmitting: boolean;
  completedSteps: Set<number>;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
}

const initialFormData: KYCFormData = {
  pan_number: '',
  name_pan: '',
  dob: '',
  father_name: '',
  residency_status: 'Indian',
  pan_file: null,
  aadhar_number: '',
  aadhar_file: null,
  account_number: '',
  ifsc_code: '',
  bank_proof_file: null,
  demat_type: '',
  demat_account_id: '',
  demat_file: null,
  video_kyc_completed: false,
  signature_file: null,
  esign_completed: false,
};

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

interface KYCProviderProps {
  children: React.ReactNode;
}

export const KYCProvider: React.FC<KYCProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<KYCFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateFormData = useCallback((updates: Partial<KYCFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
    setCompletedSteps(new Set());
  }, []);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const submitKYC = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('KYC Context: Starting submission...');
      console.log('Form data:', formData);
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.pan_number || !formData.name_pan || !formData.dob || !formData.father_name || !formData.residency_status ||
          !formData.aadhar_number || !formData.account_number || !formData.ifsc_code ||
          !formData.demat_type || !formData.demat_account_id) {
        console.log('KYC Context: Validation failed - missing required fields');
        return {
          success: false,
          message: 'Please complete all required fields'
        };
      }

      // Validate files
      if (!formData.pan_file || !formData.aadhar_file || !formData.bank_proof_file || !formData.demat_file || !formData.signature_file) {
        console.log('KYC Context: Validation failed - missing files');
        console.log('PAN file:', !!formData.pan_file);
        console.log('Aadhar file:', !!formData.aadhar_file);
        console.log('Bank proof file:', !!formData.bank_proof_file);
        console.log('Demat file:', !!formData.demat_file);
        console.log('Signature file:', !!formData.signature_file);
        return {
          success: false,
          message: 'All document files are required: PAN, Aadhar, Bank Proof, Demat, and Signature'
        };
      }

      // Get user token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      console.log('KYC Context: Token found:', !!token);
      if (!token) {
        console.log('KYC Context: No token found');
        return {
          success: false,
          message: 'Please login to submit KYC application'
        };
      }

      // Create FormData
      const submitFormData = new FormData();
      submitFormData.append('pan_number', formData.pan_number);
      submitFormData.append('name_pan', formData.name_pan);
      submitFormData.append('dob', formData.dob);
      submitFormData.append('father_name', formData.father_name);
      submitFormData.append('residency_status', formData.residency_status);
      submitFormData.append('aadhar_number', formData.aadhar_number);
      submitFormData.append('account_number', formData.account_number);
      submitFormData.append('ifsc_code', formData.ifsc_code);
      submitFormData.append('demat_type', formData.demat_type);
      submitFormData.append('demat_account_id', formData.demat_account_id);
      
      // Add all files
      submitFormData.append('pan', formData.pan_file);
      submitFormData.append('aadhar', formData.aadhar_file);
      submitFormData.append('bank_proof', formData.bank_proof_file);
      submitFormData.append('demat', formData.demat_file);
      submitFormData.append('sign', formData.signature_file);

      // Submit to API
      console.log('KYC Context: Submitting to API...');
      const response = await fetch('/api/auth/kyc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      });

      console.log('KYC Context: API response status:', response.status);
      const result = await response.json();
      console.log('KYC Context: API response data:', result);

      if (result.success) {
        return {
          success: true,
          message: 'KYC application submitted successfully!'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to submit KYC application'
        };
      }
    } catch (error) {
      console.error('KYC Context: Error submitting KYC:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const value: KYCContextType = {
    formData,
    updateFormData,
    resetFormData,
    submitKYC,
    isSubmitting,
    completedSteps,
    markStepCompleted,
    isStepCompleted,
  };

  return (
    <KYCContext.Provider value={value}>
      {children}
    </KYCContext.Provider>
  );
};
