import React from 'react';

export default function AboutPage() {

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">About Ms Intern</h1>
          <p className="text-gray-700">Your trusted partner in finding the perfect internship opportunity.</p>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">🧭 Mission Statement</h2>
              <p className="max-w-3xl text-gray-700">
                Our mission is to centralize and streamline early-career opportunity access, starting with internships built for the class of tomorrow.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div 
                className="w-64 h-48 rounded-lg flex items-center justify-center shadow-lg bg-purpleBrand-light border-2 border-purpleBrand"
              >
                <div className="text-center">
                  <div className="text-6xl mb-2">🎯</div>
                  <div 
                    className="font-semibold text-lg text-purpleBrand-accent"
                  >
                    Find Your Path
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Idea Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">💡 Core Idea</h2>
          <div className="max-w-4xl text-gray-700">
            <p>
              Ms Intern is a centralized platform that shows only currently open internships filtered by graduation year, industry, season, and location—solving the messy experience of digging through outdated or irrelevant job boards.
            </p>
            <p className="mt-4">
              Think of it as a ‘real-time internship radar’ built for students and early-career applicants.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">🪜 Phases / Roadmap</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Phase 1: MVP',
                desc: 'Filters, curated listings, dashboard.',
              },
              {
                title: 'Phase 2: Growth',
                desc: 'Email notifications, more industries, autofill.',
              },
              {
                title: 'Phase 3: Premium/Community',
                desc: 'Reviews, resume tips, recruiter analytics.',
              },
            ].map((p) => (
              <div key={p.title} className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-gray-700">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">🧠 Why Now?</h2>
          <p className="max-w-4xl text-gray-700">
            Students are frustrated with LinkedIn, Handshake, and Indeed—all bloated, outdated, or unfiltered. Recruiting seasons start earlier than ever. There's no real-time, deadline-first, class-year-aware internship dashboard. Ms Intern fills that gap.
          </p>
        </div>
      </section>

      {/* Ideal Users Section */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">🎯 Ideal Users</h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>College students (Sophomores & Juniors especially)</li>
            <li>Bootcamp grads</li>
            <li>Career centers & advisors</li>
            <li>First-gen students</li>
            <li>Recruiters (long-term B2B)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}


