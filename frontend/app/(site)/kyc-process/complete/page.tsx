'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { useKYC } from '@/contexts/KYCContext';

export default function KYCCompletePage() {
  const router = useRouter();
  const { formData, resetFormData } = useKYC();

  // Don't reset form data immediately - let user see their submitted data
  // Reset will happen when they navigate away or refresh

  const handleNavigation = (path: string) => {
    // Reset form data when user navigates away
    resetFormData();
    
    // Check if this is a stock-buy flow
    const kycFlow = sessionStorage.getItem('kycFlow');
    const returnUrl = sessionStorage.getItem('returnAfterKYC');
    
    if (kycFlow === 'stock-buy' && returnUrl) {
      // Return to the stock page
      router.push(returnUrl);
      // Clean up after successful redirect
      sessionStorage.removeItem('kycFlow');
      sessionStorage.removeItem('returnAfterKYC');
    } else {
      // Default navigation
      router.push(path);
    }
  };

  const handleDashboardChoice = () => {
    // Check if this is a stock-buy flow
    const kycFlow = sessionStorage.getItem('kycFlow');
    const returnUrl = sessionStorage.getItem('returnAfterKYC');
    
    if (kycFlow === 'stock-buy' && returnUrl) {
      // Return to the stock page
      router.push(returnUrl);
      // Clean up after successful redirect
      sessionStorage.removeItem('kycFlow');
      sessionStorage.removeItem('returnAfterKYC');
    } else {
      // Default redirect to dashboard
      resetFormData();
      router.push('/dashboard');
    }
  };

  const handleHomeChoice = () => {
    // Check if this is a stock-buy flow
    const kycFlow = sessionStorage.getItem('kycFlow');
    const returnUrl = sessionStorage.getItem('returnAfterKYC');
    
    if (kycFlow === 'stock-buy' && returnUrl) {
      // Return to the stock page
      router.push(returnUrl);
      // Clean up after successful redirect
      sessionStorage.removeItem('kycFlow');
      sessionStorage.removeItem('returnAfterKYC');
    } else {
      // Default redirect to home
      resetFormData();
      router.push('/');
    }
  };

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        <div className="text-center max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl sm:text-4xl font-bold text-themeTeal mb-4">
            KYC Application Submitted Successfully!
          </h1>
          
          <p className="text-lg text-themeTealLighter mb-8">
            Thank you for completing your KYC process. Your application is now under review.
          </p>

          {/* Application Details */}
          <div className="bg-themeTealWhite border border-themeTealLighter rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-themeTeal mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Summary
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-themeTeal border-b border-themeTealLighter pb-2">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">PAN Number:</span>
                    <span className="text-themeTeal font-medium">{formData.pan_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Name:</span>
                    <span className="text-themeTeal font-medium">{formData.name_pan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Date of Birth:</span>
                    <span className="text-themeTeal font-medium">{new Date(formData.dob).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Father&apos;s Name:</span>
                    <span className="text-themeTeal font-medium">{formData.father_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Residency Status:</span>
                    <span className="text-themeTeal font-medium">{formData.residency_status}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Account Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-themeTeal border-b border-themeTealLighter pb-2">Contact & Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Aadhaar:</span>
                    <span className="text-themeTeal font-medium">{formData.aadhar_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Account Number:</span>
                    <span className="text-themeTeal font-medium">{formData.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">IFSC Code:</span>
                    <span className="text-themeTeal font-medium">{formData.ifsc_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Demat Type:</span>
                    <span className="text-themeTeal font-medium">{formData.demat_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-themeTealLighter">Demat Account ID:</span>
                    <span className="text-themeTeal font-medium">{formData.demat_account_id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mt-6 pt-4 border-t border-themeTealLighter">
              <h4 className="font-medium text-themeTeal mb-3">Uploaded Documents</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-themeTealLighter">Bank Proof:</span>
                  <span className="text-themeTeal font-medium">
                    {formData.bank_proof_file?.name || 'No file uploaded'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-themeTealLighter">Signature:</span>
                  <span className="text-themeTeal font-medium">
                    {formData.signature_file?.name || 'No file uploaded'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">What happens next?</h3>
            </div>
            
            <ul className="text-sm text-blue-700 space-y-2 text-left">
              <li>• Your application will be reviewed by our team within 24-48 hours</li>
              <li>• You will receive an email notification once the review is complete</li>
              <li>• If approved, you can start trading immediately</li>
              <li>• If additional documents are required, we will contact you</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDashboardChoice}
              className="px-6 py-3 bg-themeSkyBlue text-white rounded-lg font-medium hover:bg-themeTeal transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleHomeChoice}
              className="px-6 py-3 border border-themeTealLighter text-themeTeal rounded-lg font-medium hover:bg-themeTealWhite transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-themeTealLighter">
            <p className="text-sm text-themeTealLighter">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@investapp.com" className="text-themeSkyBlue hover:underline">
                support@investapp.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
