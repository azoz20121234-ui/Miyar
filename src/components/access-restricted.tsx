"use client";

import Link from "next/link";

import { PAGE_PERMISSION_MAP } from "@/lib/role-model";
import { useRoleSession } from "@/store/role-session-context";

export const AccessRestricted = ({ pageId }: { pageId: keyof typeof PAGE_PERMISSION_MAP }) => {
  const { roleLabel, defaultHref } = useRoleSession();
  const page = PAGE_PERMISSION_MAP[pageId];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-lg text-white">
        م
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-white">Access Restricted</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        صفحة {page.label} غير متاحة لدور {roleLabel} في هذا الـ MVP.
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          href={defaultHref}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          العودة إلى الصفحة المتاحة
        </Link>
      </div>
    </div>
  );
};
