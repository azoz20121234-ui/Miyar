"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrencyRange, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

const flow = [
  {
    label: "A",
    title: "تحليل الوظيفة",
    text: "تفكيك الدور إلى مهام فعلية، أدوات، بيئة، ومخاطر تشغيلية بدل الاكتفاء بالمسمى الوظيفي."
  },
  {
    label: "B",
    title: "ملف القدرات التشغيلية",
    text: "وصف ما يستطيع المرشح تنفيذه فعليًا والظروف التي تحافظ على الأداء."
  },
  {
    label: "C",
    title: "مطابقة قابلة للتفسير",
    text: "إخراج فجوات وعوائق ودرجة خطورة باستخدام scoring واضح وليس ذكاءً مبهمًا."
  },
  {
    label: "D",
    title: "تكييف مسعّر",
    text: "تحويل الفجوات إلى خطة تنفيذية تشمل التكلفة والزمن والأثر المتوقع."
  }
];

export default function LandingPage() {
  const { bundle } = useAssessment();

  return (
    <AppShell
      title="محرك قرار تشغيلي قبل التوظيف"
      subtitle="ليس منصة وظائف. ميار يحوّل قرار التوظيف الشامل من خطاب عام إلى قرار تشغيلي واضح: ملاءمة فعلية، تكلفة تكييف، وحجم تغيير يمكن للإدارة اعتماده بثقة."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="قرار الديمو"
            value={statusLabel(bundle.report.status)}
            hint="السيناريو الجاهز ينتهي بتوصية: مناسب بعد التهيئة."
            tone="success"
          />
          <MetricCard
            label="الجاهزية النهائية"
            value={`${bundle.report.finalReadiness}%`}
            hint="درجة مركبة تجمع ملاءمة المهام والبيئة وقابلية تنفيذ التكييف."
            tone="warning"
          />
          <MetricCard
            label="تكلفة التهيئة"
            value={formatCurrencyRange(bundle.report.totalCostRangeSar)}
            hint="تكلفة واضحة بدل مفاجآت بعد التوظيف."
            tone="neutral"
          />
          <MetricCard
            label="زمن التنفيذ"
            value={`${bundle.plan.maxImplementationDays} أيام`}
            hint="الفترة المطلوبة للوصول إلى اعتماد تشغيلي أولي."
            tone="neutral"
          />
        </section>

        <SectionCard
          eyebrow="Product Identity"
          title="قيمة المنتج"
          description="المنصة تبيع وضوح القرار قبل التوظيف، لا نشر الوظائف ولا إدارة السير الذاتية."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-accent/20 bg-accent/10 p-6">
              <div className="mb-3 text-sm text-accent">المعادلة الأساسية</div>
              <div className="text-3xl font-semibold leading-relaxed text-white">
                الوظيفة × القدرات المثبتة + التكييف المسعّر
              </div>
              <div className="mt-3 text-lg text-slate-300">= توظيف مستدام وقابل للتنفيذ</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-gold">القيمة</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  خفض ضبابية القرار قبل العرض الوظيفي وتحويله إلى أرقام وخيارات تنفيذ.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-gold">التميز</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  تركيز على التشغيل والامتثال والاستمرارية، لا على التوظيف العام أو السرد التوعوي.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-gold">قابلية التنفيذ</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  نطاق MVP محدود للوظائف المكتبية والإعاقة البصرية والسمعية والحركية الرقمية.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-gold">تجربة المستخدم</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  واجهات قرارية واضحة يمكن عرضها على الإدارة واللجان دون شرح طويل.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Decision Flow"
          title="كيف يعمل محرك القرار"
          description="تدفق واحد من بداية تحليل الوظيفة حتى التوصية النهائية."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {flow.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  {item.label}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Demo"
          title="سيناريو الديمو الجاهز"
          description="وظيفة إدخال بيانات ودعم إداري لمرشح لديه ضعف بصري ضمن بيئة مكتبية رقمية في السعودية."
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-white">القرار الحالي</div>
                  <StatusPill label={statusLabel(bundle.report.status)} tone="success" />
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  النظام اكتشف أن المهام الأساسية قابلة للتنفيذ بعد تهيئة وصول رقمي، مع مخاطر رئيسية تتمثل في
                  الحقول غير الموسومة والملفات المصورة.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">أهم العوائق</div>
                  <div className="mt-3 space-y-2">
                    {bundle.report.topBarriers.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">التكييفات الحاسمة</div>
                  <div className="mt-3 space-y-2">
                    {bundle.report.topActions.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-6">
              <div className="text-sm text-gold">الانتقال السريع</div>
              <div className="mt-3 text-2xl font-semibold text-white">ابدأ مباشرة من مساحة العمل</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                كل صفحة في الديمو متصلة فعليًا بالحالة نفسها: أي تعديل في المهام أو القدرات ينعكس مباشرة على
                المطابقة والتقرير.
              </p>
              <div className="mt-6 grid gap-3">
                <Link
                  href="/workspace"
                  className="rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-[#59dbe3]"
                >
                  دخول مساحة صاحب العمل
                </Link>
                <Link
                  href="/job-analysis"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-slate-200 transition hover:bg-white/10"
                >
                  بدء تحليل الوظيفة
                </Link>
                <Link
                  href="/readiness-report"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-slate-200 transition hover:bg-white/10"
                >
                  عرض التقرير التنفيذي
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
