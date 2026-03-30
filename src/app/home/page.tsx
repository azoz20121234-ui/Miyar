"use client";

import { RoleHubView } from "@/components/role-hub-view";
import { getRoleHomeContent } from "@/data/role-content";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

export default function RoleHomePage() {
  const { bundle } = useAssessment();
  const { role } = useRoleSession();
  const content = getRoleHomeContent(role, bundle);

  return (
    <RoleHubView
      pageId="home"
      title={content.title}
      subtitle={content.subtitle}
      cta={content.cta}
      metrics={content.metrics}
      actions={content.actions}
      rows={content.rows}
      sectionLabel="Role Home"
    />
  );
}
