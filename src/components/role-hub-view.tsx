"use client";

import Link from "next/link";

import { AppPageId } from "@/lib/role-model";

import { AppShell } from "./app-shell";
import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import { StatusPill } from "./status-pill";

interface RoleHubViewProps {
  pageId: AppPageId;
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  metrics: Array<{
    label: string;
    value: string;
    hint: string;
    tone?: "neutral" | "success" | "warning" | "danger";
  }>;
  actions: Array<{
    title: string;
    meta?: string;
    status?: string;
  }>;
  rows: Array<{
    primary: string;
    secondary: string;
    status: string;
    owner?: string;
  }>;
  sectionLabel: string;
}

const toneForStatus = (status?: string) => {
  if (!status) return "neutral";
  if (
    status.includes("جاهز") ||
    status.includes("معتمد") ||
    status.includes("success") ||
    status.includes("Approve")
  ) {
    return "success";
  }

  if (
    status.includes("مطلوب") ||
    status.includes("warning") ||
    status.includes("Review") ||
    status.includes("Request")
  ) {
    return "warning";
  }

  if (status.includes("Reject") || status.includes("رفض")) {
    return "danger";
  }

  return "neutral";
};

export const RoleHubView = ({
  pageId,
  title,
  subtitle,
  cta,
  metrics,
  actions,
  rows,
  sectionLabel
}: RoleHubViewProps) => (
  <AppShell
    pageId={pageId}
    title={title}
    subtitle={subtitle}
    actions={
      <Link
        href={cta.href}
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        {cta.label}
      </Link>
    }
  >
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {metrics.slice(0, 3).map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone ?? "neutral"}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          eyebrow="Primary Work"
          title="الأعمال الرئيسية"
          description="أهم ما يحتاجه هذا الدور الآن."
        >
          <div className="space-y-3">
            {actions.map((item) => (
              <div key={item.title} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{item.title}</div>
                    {item.meta ? <div className="mt-1 text-sm text-slate-400">{item.meta}</div> : null}
                  </div>
                  {item.status ? <StatusPill label={item.status} tone={toneForStatus(item.status)} /> : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow={sectionLabel}
          title="آخر العناصر"
          description="قائمة مختصرة مرتبطة بالدور الحالي."
        >
          <div className="overflow-hidden rounded-[20px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right">العنصر</th>
                  <th className="px-4 py-3 text-right">التفصيل</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">المالك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {rows.map((row) => (
                  <tr key={`${row.primary}-${row.status}`}>
                    <td className="px-4 py-4 text-white">{row.primary}</td>
                    <td className="px-4 py-4 text-slate-300">{row.secondary}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={row.status} tone={toneForStatus(row.status)} />
                    </td>
                    <td className="px-4 py-4 text-slate-400">{row.owner ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </section>
    </div>
  </AppShell>
);
