import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthSessionProvider from "./components/SessionProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mr.Intern - Your Internship Discovery Partner",
  description: "Find your perfect internship opportunity with Mr.Intern. Track applications, get career advice, and connect with recruiters.",
  keywords: "internships, career, students, applications, tracking, reviews, advice",
  authors: [{ name: "Mr.Intern Team" }],
  openGraph: {
    title: "Mr.Intern - Your Internship Discovery Partner",
    description: "Find your perfect internship opportunity with Mr.Intern",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mr.Intern - Your Internship Discovery Partner",
    description: "Find your perfect internship opportunity with Mr.Intern",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-800`}
        suppressHydrationWarning
      >
        <AuthSessionProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem-8rem)]">{children}</main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
