import Link from 'next/link';
import Image from 'next/image';
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
            <div className="flex items-center justify-center mb-4">
              <Image src="/logo.png" alt="Internly logo" width={48} height={48} />
            </div>
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
                <Image src="/logo.png" alt="Internly logo" width={24} height={24} className="mr-2 hidden sm:inline" />
                Browse Internships
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="pt-16 pb-16">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-center">
            <div 
              className="h-48 w-full max-w-md rounded-xl border-2 border-gray-200 bg-white shadow-lg flex items-center justify-center relative"
            >
              <div className="absolute -top-16 sm:-top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-purpleBrand-light to-purpleBrand-accent rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <div className="w-5 h-5 bg-purpleBrand-accent rounded-md"></div>
                  </div>
                </div>
              </div>
              <div className="text-center px-6 pt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700">
                  To make internship discovery simple, fair, and timely—so students spend less time
                  searching and more time succeeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Idea Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
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
