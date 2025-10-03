import React from 'react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 mb-6">
            These terms of service govern your use of Ms Intern and our platform. 
            Please read these terms carefully before using our services.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Ms Intern, you accept and agree to be bound by the 
            terms and provision of this agreement.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily download one copy of Ms Intern for 
            personal, non-commercial transitory viewing only.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
          <p className="mb-4">
            The materials on Ms Intern are provided on an 'as is' basis. Ms Intern makes 
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
