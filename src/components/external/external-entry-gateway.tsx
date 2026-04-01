"use client";

import Link from "next/link";

export const ExternalEntryGateway = () => (
  <div className="min-h-screen bg-cinematic text-slate-100">
    <div className="mx-auto flex min-h-screen max-w-[1080px] flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="surface-card p-8 sm:p-10">
          <div className="portal-label text-center">بوابة الدخول</div>
          <h1 className="mx-auto mt-4 max-w-4xl text-center text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[56px]">
            اتخذ قرار التوظيف بثقة
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-slate-400 sm:text-base">
            يربط Meyar بين الوظيفة والقدرات والتكييف لإصدار قرار تشغيلي واضح قبل التوظيف.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Link
              href="/external/candidate"
              className="surface-card-muted px-6 py-7 text-right transition hover:bg-white/[0.05]"
            >
              <div className="text-3xl">👤</div>
              <div className="mt-4 text-xl font-semibold text-white">أنا مرشح</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">ابدأ ملف القدرات والأدلة.</div>
              <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                ابدأ الملف
              </div>
            </Link>

            <Link
              href="/external/employer"
              className="surface-card-muted px-6 py-7 text-right transition hover:bg-white/[0.05]"
            >
              <div className="text-3xl">🏢</div>
              <div className="mt-4 text-xl font-semibold text-white">أنا جهة عمل</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">عرّف الوظيفة كما تُمارس فعليًا.</div>
              <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                عرّف الوظيفة
              </div>
            </Link>

            <Link
              href="/external/submit"
              className="rounded-[28px] border border-white/10 bg-white px-6 py-7 text-right transition hover:bg-slate-200"
            >
              <div className="text-3xl">⚡</div>
              <div className="mt-4 text-xl font-semibold text-slate-950">ابدأ التقييم</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">راجع الملخص التمهيدي ثم ادخل إلى نواة Meyar.</div>
              <div className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                ابدأ القرار
              </div>
            </Link>
          </div>
        </section>

        <section className="surface-card-soft p-5 sm:p-6">
          <div className="portal-label">تسلسل القرار</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {["المرشح", "الوظيفة", "التكييف", "القرار"].map((item, index) => (
              <div
                key={item}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-slate-200">
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-white">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface-card-soft p-6">
            <div className="portal-label">نواة Meyar</div>
            <div className="mt-3 text-2xl font-semibold text-white">محرك القرار الداخلي</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">
              للأدوار المؤسسية، ومسار الاعتماد، وإصدار القرار.
            </div>
          </div>

          <div className="surface-card-soft p-6">
            <div className="portal-label">البوابات الخارجية</div>
            <div className="mt-3 text-2xl font-semibold text-white">إدخال ومتابعة محدودة</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">
              للمرشح وجهة العمل قبل انتقال الحالة إلى فريق التقييم.
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
);
