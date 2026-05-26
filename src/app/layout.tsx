import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex | Intelligent ATS for Bharat",
  description: "AI-powered Applicant Tracking System that finds peak potential in every candidate. Built for Bharat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{ baseTheme: dark }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} antialiased min-h-screen bg-background`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
