"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  APP_ROLES,
  AppPageId,
  AppRole,
  canAccessPage,
  getFirstAllowedHref,
  getRoleConfig
} from "@/lib/role-model";

interface RoleSessionContextValue {
  role: AppRole;
  roleLabel: string;
  roleDescription: string;
  defaultHref: string;
  setRole: (role: AppRole) => void;
  canAccess: (pageId: AppPageId) => boolean;
}

const STORAGE_KEY = "miyar-role-session";

const RoleSessionContext = createContext<RoleSessionContextValue | null>(null);

export const RoleSessionProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<AppRole>("case-initiator");

  useEffect(() => {
    const storedRole = window.localStorage.getItem(STORAGE_KEY) as AppRole | null;
    if (!storedRole || !APP_ROLES.includes(storedRole)) {
      return;
    }

    setRole(storedRole);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const value = useMemo<RoleSessionContextValue>(() => {
    const config = getRoleConfig(role);

    return {
      role,
      roleLabel: config.label,
      roleDescription: config.description,
      defaultHref: getFirstAllowedHref(role),
      setRole,
      canAccess: (pageId) => canAccessPage(role, pageId)
    };
  }, [role]);

  return <RoleSessionContext.Provider value={value}>{children}</RoleSessionContext.Provider>;
};

export const useRoleSession = () => {
  const context = useContext(RoleSessionContext);

  if (!context) {
    throw new Error("useRoleSession must be used within RoleSessionProvider");
  }

  return context;
};
