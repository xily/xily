import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import HomeCarousel from './components/HomeCarousel';

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

      {/* Mission + Why carousel */}
      <HomeCarousel />

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
