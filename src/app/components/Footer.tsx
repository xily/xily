import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="Internly logo" width={24} height={24} />
          </Link>
          <p className="text-sm text-gray-600">© 2025 Ms Intern. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <Link href="/privacy" className="transition hover:text-purpleBrand-accent">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="transition hover:text-purpleBrand-accent">Terms of Service</Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="transition hover:text-purpleBrand-accent">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

