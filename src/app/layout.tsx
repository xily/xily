import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthSessionProvider from "./components/SessionProvider";
import { Toaster } from "react-hot-toast";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Internly",
  description: "The all-in-one internship dashboard that helps students find the right opportunities at the right time.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Internly",
    description: "The all-in-one internship dashboard for students.",
    url: "https://yourdomain.com",
    siteName: "Internly",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Internly Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internly",
    description: "A real-time internship radar for students.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={josefin.variable}>
      <body
        className={`font-sans antialiased bg-white text-gray-800`}
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
