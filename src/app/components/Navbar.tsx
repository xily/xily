"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/internships', label: 'Internships' },
  { href: '/advice', label: 'Advice Board' },
  { href: '/contact', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center select-none text-xl font-semibold tracking-tight text-gray-800 hover:text-purpleBrand-accent">
              <Image src="/logo.png" alt="Internly logo" width={32} height={32} className="mr-2" />
              Ms Intern
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center space-x-6 md:flex">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? 'text-gray-900 border-b-2 border-purpleBrand-accent pb-1'
                    : 'text-gray-700 hover:text-purpleBrand-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-gray-900 border-b-2 border-purpleBrand-accent pb-1'
                      : 'text-gray-700 hover:text-purpleBrand-accent'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/recruiter"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/recruiter'
                      ? 'text-gray-900 border-b-2 border-purpleBrand-accent pb-1'
                      : 'text-gray-700 hover:text-purpleBrand-accent'
                  }`}
                >
                  Recruiter
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold text-gray-700 transition-colors hover:text-purpleBrand-accent"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 transition-colors hover:text-purpleBrand-accent"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-gray-700 transition-colors hover:text-purpleBrand-accent"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purpleBrand-accent md:hidden"
          >
            <svg
              className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div
        className={`md:hidden transition-all duration-200 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-4 origin-top rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col py-2">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-purpleBrand-light text-purpleBrand-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-purpleBrand-light text-purpleBrand-accent'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent'
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/recruiter"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === '/recruiter'
                      ? 'bg-purpleBrand-light text-purpleBrand-accent'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent'
                  }`}
                  onClick={closeMenu}
                >
                  Recruiter
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-purpleBrand-accent"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

