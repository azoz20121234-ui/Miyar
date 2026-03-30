import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Tajawal } from "next/font/google";

import "./globals.css";

import { AssessmentProvider } from "@/store/assessment-context";

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
  title: "ميار | قرار تشغيلي قبل التوظيف",
  description:
    "منصة عربية RTL لتحليل الوظيفة، بناء ملف القدرات التشغيلية، واقتراح خطة تكييف مسعّرة قبل اتخاذ قرار التوظيف."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${bodyFont.variable} ${headingFont.variable} bg-ink text-slate-100`}>
        <AssessmentProvider>{children}</AssessmentProvider>
      </body>
    </html>
  );
}
