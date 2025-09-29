import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(
    cookieStore.get('session')?.value || cookieStore.get('token')?.value
  );

  const ctaHref = isLoggedIn ? '/dashboard' : '/login';

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purpleBrand-light via-white to-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Ms Intern
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Your Internship Discovery Partner
            </p>
            <div className="mt-8">
              <Link
                href="/internships"
                className="inline-flex items-center justify-center rounded-lg bg-purpleBrand text-black px-6 py-3 shadow-sm transition-colors hover:bg-purpleBrand-dark"
              >
                Browse Internships
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-gray-700">
                To make internship discovery simple, fair, and timely—so students spend less time
                searching and more time succeeding.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div 
                className="h-48 w-full max-w-md rounded-xl border-2 border-gray-200 bg-white shadow-lg flex items-center justify-center"
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
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 text-3xl" aria-hidden>
              🎯
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Why Ms Intern?</h2>
            <p className="mt-4 text-gray-700">
              Ms Intern is your real-time internship radar. We filter opportunities by graduation year,
              industry, season, and location—so you only see what's open and relevant.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Ready to land your next internship?
            </h3>
            <div className="mt-6">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-lg bg-purpleBrand text-black px-6 py-3 shadow-sm transition-colors hover:bg-purpleBrand-dark"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
