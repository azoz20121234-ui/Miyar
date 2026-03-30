import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Tajawal } from "next/font/google";

import "./globals.css";

import { AssessmentProvider } from "@/store/assessment-context";
import { RoleSessionProvider } from "@/store/role-session-context";

const bodyFont = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

const headingFont = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Meyar — Decision & Compliance Standard Engine",
  description:
    "Arabic RTL platform for role-based decision review, standards checks, operational capability assessment, and pre-employment compliance readiness."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${bodyFont.variable} ${headingFont.variable} bg-ink text-slate-100`}>
        <RoleSessionProvider>
          <AssessmentProvider>{children}</AssessmentProvider>
        </RoleSessionProvider>
      </body>
    </html>
  );
}
