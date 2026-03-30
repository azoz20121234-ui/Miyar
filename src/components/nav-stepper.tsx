"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "الرئيسية" },
  { href: "/workspace", label: "المساحة" },
  { href: "/job-analysis", label: "تحليل الوظيفة" },
  { href: "/candidate-profile", label: "ملف القدرات" },
  { href: "/matching", label: "المطابقة" },
  { href: "/accommodation-plan", label: "التكييف" },
  { href: "/readiness-report", label: "التقرير" },
  { href: "/dashboard", label: "اللوحة" }
];

export const NavStepper = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2 py-2 lg:block">
      <div className="flex items-center gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm transition ${
                active
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
