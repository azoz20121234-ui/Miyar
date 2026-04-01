import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Tajawal } from "next/font/google";

import "./globals.css";

import { AssessmentProvider } from "@/store/assessment-context";
import { RoleSessionProvider } from "@/store/role-session-context";

const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const headingFont = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700", "800"]
});

export const metadata: Metadata = {
  title: "Meyar — محرك القرار والامتثال المعياري",
  description:
    "منصة عربية RTL لمراجعة القرار حسب الدور، وفحص المعايير، وتقييم القدرات التشغيلية، وجاهزية ما قبل التوظيف."
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
