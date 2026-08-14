import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Scoped to the HR module only (applied via HRShell's root className) — the
// bolder, rounder geometric sans the HR reference design uses throughout.
// Added as its own variable rather than touching --font-sans, which every
// other module still resolves to Geist/Arial.
const hrSans = Plus_Jakarta_Sans({
  variable: "--font-hr-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EOS ERP Portal",
  description: "Sri Eshwar College of Engineering ERP portal",
  icons: {
    icon: "/assest/secelogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hrSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
