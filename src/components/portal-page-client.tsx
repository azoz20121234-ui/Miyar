"use client";

import { getPortalPageContent } from "@/data/role-content";
import { PORTAL_PAGE_KEYS, type PortalSlug } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { RoleHubView } from "./role-hub-view";

export const PortalPageClient = ({ slug }: { slug: PortalSlug }) => {
  const { bundle } = useAssessment();
  const { role } = useRoleSession();
  const content = getPortalPageContent(slug, role, bundle);

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
