import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 mb-6">
            This privacy policy describes how Ms Intern collects, uses, and protects 
            your personal information when you use our platform.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create 
            an account, save internships, or contact us for support.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our 
            services, communicate with you, and personalize your experience.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us 
            at privacy@internly.com
          </p>
        </div>
      </div>
    </div>
  );
}
