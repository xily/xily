import React from 'react';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Contact Us</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 mb-6">
            Have questions about Ms Intern? We'd love to hear from you. Send us a 
            message and we'll respond as soon as possible.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> xilyofficial@gmail.com</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I save internships?
              </h3>
              <p className="text-gray-600">
                Simply click the "Save" button on any internship card. You'll need to 
                create an account first if you haven't already.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How often are internships updated?
              </h3>
              <p className="text-gray-600">
                We update our internship listings daily to ensure you have access to 
                the most current opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I track my application status?
              </h3>
              <p className="text-gray-600">
                Yes! Once you save an internship, you can track your application 
                status and add notes in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
