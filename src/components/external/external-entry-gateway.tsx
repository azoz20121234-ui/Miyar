"use client";

import Link from "next/link";

export const ExternalEntryGateway = () => (
  <div className="min-h-screen bg-cinematic text-slate-100">
    <div className="mx-auto flex min-h-screen max-w-[980px] flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="surface-card p-8 text-center sm:p-10">
        <div className="portal-label">Meyar</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[54px]">
          اتخذ قرار التوظيف بثقة
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Meyar يربط الوظيفة ← القدرات ← التكييف ← القرار
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/external/candidate"
            className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-7 text-center transition hover:bg-white/[0.07]"
          >
            <div className="text-3xl">👤</div>
            <div className="mt-4 text-xl font-semibold text-white">أنا مرشح</div>
          </Link>

          <Link
            href="/external/employer"
            className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-7 text-center transition hover:bg-white/[0.07]"
          >
            <div className="text-3xl">🏢</div>
            <div className="mt-4 text-xl font-semibold text-white">أنا جهة عمل</div>
          </Link>

          <Link
            href="/external/submit"
            className="rounded-[28px] bg-white px-6 py-7 text-center transition hover:bg-slate-200"
          >
            <div className="text-3xl">⚡</div>
            <div className="mt-4 text-xl font-semibold text-slate-950">ابدأ القرار</div>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
