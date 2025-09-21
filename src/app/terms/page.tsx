import React from 'react';

export default function TermsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 mb-6">
            This is a placeholder terms of service page. In a production application, 
            this would contain detailed terms and conditions for using our platform.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Internly, you accept and agree to be bound by the 
            terms and provision of this agreement.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily download one copy of Internly for 
            personal, non-commercial transitory viewing only.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
          <p className="mb-4">
            The materials on Internly are provided on an 'as is' basis. Internly makes 
            no warranties, expressed or implied, and hereby disclaims and negates all 
            other warranties including without limitation, implied warranties or 
            conditions of merchantability, fitness for a particular purpose, or 
            non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us 
            at legal@internly.com
          </p>
        </div>
      </div>
    </div>
  );
}
