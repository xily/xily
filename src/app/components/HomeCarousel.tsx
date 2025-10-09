'use client';

import React, { useState } from 'react';

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    if (index < 0) {
      setCurrentIndex(1);
      return;
    }
    if (index > 1) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex(index);
  };

  return (
    <section className="pt-16 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative mx-auto max-w-3xl">
          {/* Viewport - hides offscreen slides */}
          <div className="overflow-x-hidden overflow-y-visible rounded-2xl bg-white shadow-lg border border-gray-200">
            {/* Slides track */}
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
            {/* Slide 1: Our Mission */}
            <div className="min-w-full px-6 py-12 flex items-center justify-center">
              <div className="w-full max-w-md text-center px-6 pt-6 pb-2">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700">
                  To make internship discovery simple, fair, and timely—so students spend less time
                  searching and more time succeeding.
                </p>
              </div>
            </div>

            {/* Slide 2: Why Ms Intern */}
            <div className="min-w-full px-6 py-12 flex items-center justify-center bg-white">
              <div className="mx-auto max-w-3xl text-center px-4">
                <h2 className="text-2xl font-semibold text-gray-900">Why Ms Intern?</h2>
                <p className="mt-4 text-gray-700">
                  Ms Intern is your real-time internship radar. We filter opportunities by graduation year,
                  industry, season, and location—so you only see what's open and relevant.
                </p>
              </div>
            </div>
            </div>
          </div>

          {/* Controls */}
          <button
            aria-label="Previous"
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow p-2 border border-gray-200"
          >
            <span className="sr-only">Previous</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button
            aria-label="Next"
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow p-2 border border-gray-200"
          >
            <span className="sr-only">Next</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[0, 1].map((i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-purpleBrand-accent' : 'w-2.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


