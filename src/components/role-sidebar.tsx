"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getRoleConfig } from "@/lib/role-model";
import { useRoleSession } from "@/store/role-session-context";

import { RoleSwitcher } from "./role-switcher";

export const RoleSidebar = () => {
  const pathname = usePathname();
  const { role, roleLabel, roleDescription, defaultHref } = useRoleSession();
  const config = getRoleConfig(role);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Role Session</div>
        <div className="mt-3 text-lg font-semibold text-white">{roleLabel}</div>
        <div className="mt-2 text-sm leading-6 text-slate-400">{roleDescription}</div>
        <div className="mt-4">
          <RoleSwitcher />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Navigation</div>
        <div className="mt-4 space-y-2">
          {config.navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white text-slate-950"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {active ? <span className="text-xs">Active</span> : null}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Primary Action</div>
        <Link
          href={config.primaryAction.href}
          className="mt-4 block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          {config.primaryAction.label}
        </Link>
        <Link
          href={defaultHref}
          className="mt-3 block rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-center text-sm text-slate-200 transition hover:bg-white/5"
        >
          ارجع إلى لوحة الدور
        </Link>
      </div>
    </div>
  );
};
