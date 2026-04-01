"use client";

import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { standardsOwnerLabel, standardsTone } from "@/lib/standards-engine";
import { CaseStandardsEvaluation } from "@/lib/standards-types";

import { AppShell } from "./app-shell";

interface CaseStandardsViewProps {
  standards: CaseStandardsEvaluation;
}

const statusLabelMap = {
  passed: "مستوفى",
  "needs-review": "بانتظار مراجعة",
  "missing-evidence": "دليل ناقص",
  blocker: "مانع"
} as const;

const evidenceLabelMap = {
  present: "موجود",
  missing: "مفقود"
} as const;

export const CaseStandardsView = ({ standards }: CaseStandardsViewProps) => (
  <AppShell
    pageId="portal:standards-check"
    title="لوحة معايير الحالة"
    subtitle="فحوصات مرتبطة بالحالة الحالية مع مالك واضح، أدلة، وما يمنع الاعتماد الآن."
    actions={
      <Link
        href="/portal/approval-panel"
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        اذهب إلى الاعتماد
      </Link>
    }
  >
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="مستوفى"
          value={`${standards.counts.passed}`}
          hint="مكتمل"
          tone="success"
        />
        <MetricCard
          label="بانتظار مراجعة"
          value={`${standards.counts["needs-review"]}`}
          hint="بانتظار مراجعة"
          tone="warning"
        />
        <MetricCard
          label="أدلة ناقصة"
          value={`${standards.counts["missing-evidence"]}`}
          hint="إثبات ناقص"
          tone="danger"
        />
        <MetricCard
          label="الموانع"
          value={`${standards.counts.blocker}`}
          hint="يمنع الاعتماد"
          tone={standards.counts.blocker > 0 ? "danger" : "success"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          eyebrow="فحوصات الحالة"
          title="لوحة معايير الحالة"
          description="الحالة والمالك والدليل والأثر."
        >
          <div className="overflow-hidden rounded-[20px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right">الفحص</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">المالك</th>
                  <th className="px-4 py-3 text-right">الدليل</th>
                  <th className="px-4 py-3 text-right">الأثر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {standards.checks.map((check) => (
                  <tr key={check.checkId}>
                    <td className="px-4 py-4">
                      <div className="text-white">{check.label}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {check.standardCode} • {check.categoryLabel}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill
                        label={statusLabelMap[check.status]}
                        tone={standardsTone(check.status)}
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {standardsOwnerLabel(check.ownerRole)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-200">
                        {evidenceLabelMap[check.evidenceStatus]}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{check.evidenceSummary}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{check.impactLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="الأدلة"
            title="متطلبات الأدلة"
            description="ما المطلوب ومن المسؤول."
          >
            <div className="space-y-3">
              {standards.evidenceRequirements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.standardCode} • {standardsOwnerLabel(item.ownerRole)}
                      </div>
                    </div>
                    <StatusPill
                      label={item.status === "present" ? "موجود" : "مفقود"}
                      tone={item.status === "present" ? "success" : "danger"}
                    />
                  </div>
                  <div className="mt-3 text-sm text-slate-300">{item.evidenceSummary}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="الموانع"
            title="ملخص الموانع"
            description="ما الذي يمنع الاعتماد الآن."
          >
            <div className="space-y-3">
              {standards.blockers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-rose-500/20 bg-rose-500/8 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white">{item.title}</div>
                    <StatusPill label="مانع" tone="danger" />
                  </div>
                  <div className="mt-2 text-sm text-slate-300">{item.rationale}</div>
                  <div className="mt-3 text-xs text-slate-400">
                    المسؤول: {standardsOwnerLabel(item.ownerRole)} • {item.evidenceSummary}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  </AppShell>
);
