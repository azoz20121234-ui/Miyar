"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getPortalPageContent } from "@/data/role-content";
import { PORTAL_PAGE_KEYS, type PortalSlug } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { CaseStandardsView } from "./case-standards-view";
import { ExperienceRolesView } from "./experience-roles-view";
import { RoleHubView } from "./role-hub-view";
import { StandardsLibraryView } from "./standards-library-view";

export const PortalPageClient = ({ slug }: { slug: PortalSlug }) => {
  const router = useRouter();
  const { bundle, standards, externalHandoff, isHydrated } = useAssessment();
  const { role } = useRoleSession();

  useEffect(() => {
    if (isHydrated && (!externalHandoff?.candidate || !externalHandoff?.job)) {
      router.replace("/external");
    }
  }, [externalHandoff, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="surface-card-soft p-6 text-sm text-slate-300">
        جاري تحميل الحالة...
      </div>
    );
  }

  if (!externalHandoff?.candidate || !externalHandoff?.job) {
    return null;
  }

  const content = getPortalPageContent(slug, role, bundle, standards, externalHandoff);

  if (slug === "standards") {
    return <StandardsLibraryView standards={standards} />;
  }

  if (slug === "standards-check") {
    return <CaseStandardsView standards={standards} />;
  }

  if (slug === "roles-permissions") {
    return <ExperienceRolesView />;
  }

  return (
    <RoleHubView
      pageId={PORTAL_PAGE_KEYS[slug]}
      title={content.title}
      subtitle={content.subtitle}
      cta={content.cta}
      metrics={content.metrics}
      actions={content.actions}
      rows={content.rows}
      sectionLabel={content.sectionLabel}
    />
  );
};
