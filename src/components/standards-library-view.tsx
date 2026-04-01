"use client";

import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { standardsOwnerLabel, standardsTone } from "@/lib/standards-engine";
import { CaseStandardsEvaluation } from "@/lib/standards-types";

import { AppShell } from "./app-shell";

interface StandardsLibraryViewProps {
  standards: CaseStandardsEvaluation;
}

export const StandardsLibraryView = ({
  standards
}: StandardsLibraryViewProps) => (
  <AppShell
    pageId="portal:standards"
    title="مكتبة المعايير"
    subtitle="كتالوج تشغيلي مختصر للمعايير التي بُنيت عليها Meyar وربطها بمسؤوليات المراجعة."
    actions={
      <Link
        href="/portal/standards-check"
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        اعرض فحص الحالة
      </Link>
    }
  >
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard
          label="المعايير"
          value={`${standards.overview.totalStandards}`}
          hint="عناصر الكتالوج"
        />
        <MetricCard
          label="الفحوصات"
          value={`${standards.overview.totalChecks}`}
          hint="إجمالي الفحوصات"
        />
        <MetricCard
          label="الاكتمال"
          value={`${standards.overview.completionRate}%`}
          hint="للحالة الحالية"
          tone={standards.overview.completionRate >= 70 ? "success" : "warning"}
        />
        <MetricCard
          label="الموانع"
          value={`${standards.overview.blockers}`}
          hint="قبل الاعتماد"
          tone={standards.overview.blockers > 0 ? "danger" : "success"}
        />
        <MetricCard
          label="آخر تحديث"
          value={standards.overview.lastUpdated}
          hint="لقطة الكتالوج"
        />
      </section>

      <SectionCard
        eyebrow="المكتبة"
        title="مكتبة المعايير"
        description="مبنية على مراجع واضحة وضوابط داخلية منظّمة."
      >
        <div className="overflow-hidden rounded-[20px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-right">الرمز</th>
                <th className="px-4 py-3 text-right">العنوان</th>
                <th className="px-4 py-3 text-right">الفئة</th>
                <th className="px-4 py-3 text-right">المستوى</th>
                <th className="px-4 py-3 text-right">المالك</th>
                <th className="px-4 py-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {standards.libraryRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 text-slate-300">{row.code}</td>
                  <td className="px-4 py-4">
                    <div className="text-white">{row.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.type} • {row.checksCount} فحوصات
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{row.category}</td>
                  <td className="px-4 py-4 text-slate-300">{row.level}</td>
                  <td className="px-4 py-4 text-slate-300">
                    {standardsOwnerLabel(row.ownerRole)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill
                      label={row.status}
                      tone={row.status === "نشط" ? standardsTone("active") : "warning"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  </AppShell>
);
