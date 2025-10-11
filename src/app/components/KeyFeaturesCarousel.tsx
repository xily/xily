'use client';

import React, { useState } from 'react';

export default function KeyFeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    { icon: '🎯', title: 'Smart Filtering', desc: 'Filter internships by graduation year, season, location, and industry.' },
    { icon: '📅', title: 'Live Deadline Tracker', desc: 'Shows open internships with real deadlines and countdowns.' },
    { icon: '📥', title: 'Direct Apply Links', desc: 'Each internship links directly to the application page.' },
    { icon: '🔔', title: 'Custom Alerts', desc: 'Get alerts for internships matching your timeline and interests.' },
    { icon: '🗂️', title: 'Application Tracker', desc: 'Track applied internships, statuses, and notes.' },
    { icon: '✅', title: 'Verified Listings', desc: 'Only real, vetted, and updated listings.' },
    { icon: '📊', title: 'Dashboard View', desc: 'Visual dashboard to stay organized.' },
    { icon: '🤝', title: 'Company Insights', desc: 'Optional reviews, pay info, intern experiences.' },
  ];

  const goTo = (index: number) => {
    if (index < 0) {
      setCurrentIndex(features.length - 1);
      return;
    }
    if (index >= features.length) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex(index);
  };

  const goToNext = () => goTo(currentIndex + 1);
  const goToPrev = () => goTo(currentIndex - 1);

  return (
    <section className="pt-16 pb-16 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🧱 Key Features</h2>
          <p className="text-lg text-gray-600">Everything you need to find and land your dream internship</p>
        </div>
        
        <div className="relative mx-auto max-w-4xl">
          {/* Viewport - hides offscreen slides */}
          <div className="overflow-x-hidden overflow-y-visible rounded-2xl bg-white shadow-lg border border-gray-200">
            {/* Slides track */}
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={feature.title} className="min-w-full px-8 py-12 flex items-center justify-center">
                  <div className="w-full max-w-md text-center">
                    <div className="text-6xl mb-6" aria-hidden>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-700 text-lg">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <button
            aria-label="Previous feature"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg p-3 border border-gray-200 transition-all hover:shadow-xl"
          >
            <span className="sr-only">Previous</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button
            aria-label="Next feature"
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg p-3 border border-gray-200 transition-all hover:shadow-xl"
          >
            <span className="sr-only">Next</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 py-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-purpleBrand scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
