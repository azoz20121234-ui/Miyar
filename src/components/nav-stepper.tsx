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
    <nav className="hidden rounded-full border border-white/8 bg-white/5 px-3 py-2 backdrop-blur lg:block">
      <div className="flex items-center gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                active
                  ? "bg-accent text-slate-950"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-[11px]">
                {items.indexOf(item) + 1}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
