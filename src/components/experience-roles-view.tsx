"use client";

import Link from "next/link";

import {
  EXTERNAL_ROLE_ORDER,
  EXTERNAL_ROLE_REFERENCE,
  INTERNAL_ROLE_REFERENCE
} from "@/lib/experience-roles";
import { APP_ROLES } from "@/lib/role-model";

import { AppShell } from "./app-shell";
import { StatusPill } from "./status-pill";

const visibilityLabelMap = {
  limited: "رؤية محدودة",
  operational: "رؤية تشغيلية",
  decision: "رؤية قرار",
  executive: "رؤية تنفيذية",
  full: "رؤية كاملة"
} as const;

const ItemsBlock = ({ title, items }: { title: string; items: string[] }) => (
  <div className="space-y-2">
    <div className="text-[11px] tracking-[0.16em] text-slate-500">{title}</div>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={`${title}-${item}`}
          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export const ExperienceRolesView = () => (
  <AppShell
    pageId="portal:roles-permissions"
    title="مرجع الأدوار والبوابات"
    subtitle="فصل واضح بين Meyar Core كمساحة قرار داخلية وبين الطبقة الخارجية كبوابات إدخال ومتابعة محدودة."
    actions={
      <Link
        href="/"
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        افتح مدخل المنصة
      </Link>
    }
  >
    <div className="space-y-6">
      <section className="surface-card p-6 sm:p-7">
        <div className="portal-label">النواة الداخلية</div>
        <div className="mt-3 text-2xl font-semibold text-white">النواة الداخلية</div>
        <div className="mt-2 text-sm leading-7 text-slate-400">
          محرك القرار المؤسسي الداخلي. كل دور يرى طبقة مختلفة من الحالة ويحرّكها ضمن دورة
          الحالة الحالية.
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {APP_ROLES.map((role) => {
            const item = INTERNAL_ROLE_REFERENCE[role];

            return (
              <section key={role} className="surface-card-muted p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.label}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{item.description}</div>
                  </div>
                  <StatusPill label={visibilityLabelMap[item.visibility]} tone="neutral" />
                </div>

                <div className="mt-5 space-y-4">
                  <ItemsBlock title="يرى" items={item.sees} />
                  {item.edits.length ? <ItemsBlock title="يحرر" items={item.edits} /> : null}
                  {item.submits.length ? <ItemsBlock title="يرسل" items={item.submits} /> : null}
                  <ItemsBlock title="لا يرى" items={item.hidden} />
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-6 sm:p-7">
        <div className="portal-label">الطبقة الخارجية</div>
        <div className="mt-3 text-2xl font-semibold text-white">الطبقة الخارجية</div>
        <div className="mt-2 text-sm leading-7 text-slate-400">
          بوابات إدخال ومتابعة محدودة تغذي Meyar Core بالبيانات دون كشف طبقة القرار الداخلية.
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {EXTERNAL_ROLE_ORDER.map((role) => {
            const item = EXTERNAL_ROLE_REFERENCE[role];

            return (
              <section key={role} className="surface-card-muted p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.label}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{item.description}</div>
                  </div>
                  <StatusPill
                    label={item.futureReady ? "جاهز لاحقًا" : "نشط"}
                    tone={item.futureReady ? "warning" : "success"}
                  />
                </div>

                <div className="mt-5 space-y-4">
                  <ItemsBlock title="يرى" items={item.sees} />
                  {item.edits.length ? <ItemsBlock title="يحرر" items={item.edits} /> : null}
                  {item.submits.length ? <ItemsBlock title="يرسل" items={item.submits} /> : null}
                  <ItemsBlock title="لا يرى" items={item.hidden} />
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  </AppShell>
);
