import React from 'react';

export default function AboutPage(): JSX.Element {

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">About Internly</h1>
          <p className="text-gray-700">A modern, clean platform built to make internships simple.</p>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">🧭 Mission Statement</h2>
          <p className="max-w-3xl text-gray-700">
            Our mission is to centralize and streamline early-career opportunity access, starting with internships built for the class of tomorrow.
          </p>
        </div>
      </section>

      {/* Core Idea Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">💡 Core Idea</h2>
          <div className="max-w-4xl text-gray-700">
            <p>
              Internly is a centralized platform that shows only currently open internships filtered by graduation year, industry, season, and location—solving the messy experience of digging through outdated or irrelevant job boards.
            </p>
            <p className="mt-4">
              Think of it as a ‘real-time internship radar’ built for students and early-career applicants.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">🧱 Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: '🎯', title: 'Smart Filtering', desc: 'Filter internships by graduation year, season, location, and industry.' },
              { icon: '📅', title: 'Live Deadline Tracker', desc: 'Shows open internships with real deadlines and countdowns.' },
              { icon: '📥', title: 'Direct Apply Links', desc: 'Each internship links directly to the application page.' },
              { icon: '🔔', title: 'Custom Alerts', desc: 'Get alerts for internships matching your timeline and interests.' },
              { icon: '🗂️', title: 'Application Tracker', desc: 'Track applied internships, statuses, and notes.' },
              { icon: '✅', title: 'Verified Listings', desc: 'Only real, vetted, and updated listings.' },
              { icon: '📊', title: 'Dashboard View', desc: 'Visual dashboard to stay organized.' },
              { icon: '🤝', title: 'Company Insights (future)', desc: 'Optional reviews, pay info, intern experiences.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow">
                <div className="text-2xl" aria-hidden>
                  {f.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-700">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-8 py-16">
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
        <div className="mx-auto max-w-7xl px-8 py-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">🧠 Why Now?</h2>
          <p className="max-w-4xl text-gray-700">
            Students are frustrated with LinkedIn, Handshake, and Indeed—all bloated, outdated, or unfiltered. Recruiting seasons start earlier than ever. There’s no real-time, deadline-first, class-year-aware internship dashboard. Internly fills that gap.
          </p>
        </div>
      </section>

      {/* Ideal Users Section */}
      <section>
        <div className="mx-auto max-w-7xl px-8 py-16">
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


