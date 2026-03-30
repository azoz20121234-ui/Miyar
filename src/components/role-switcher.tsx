"use client";

import { useRouter } from "next/navigation";

import { APP_ROLES, getFirstAllowedHref, getRoleConfig } from "@/lib/role-model";
import { useRoleSession } from "@/store/role-session-context";

export const RoleSwitcher = () => {
  const router = useRouter();
  const { role, setRole } = useRoleSession();

  return (
    <div className="flex flex-wrap gap-2">
      {APP_ROLES.map((item) => {
        const config = getRoleConfig(item);
        const active = item === role;

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setRole(item);
              router.push(getFirstAllowedHref(item));
            }}
            className={`rounded-full px-3 py-2 text-sm transition ${
              active
                ? "border border-white bg-white text-slate-950"
                : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/5"
            }`}
          >
            {config.shortLabel}
          </button>
        );
      })}
    </div>
  );
};
