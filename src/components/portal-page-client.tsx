"use client";

import Link from "next/link";

import { getPortalPageContent } from "@/data/role-content";
import { PORTAL_PAGE_KEYS, type PortalSlug } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { CaseStandardsView } from "./case-standards-view";
import { ExperienceRolesView } from "./experience-roles-view";
import { NewCaseIntakeView } from "./new-case-intake-view";
import { RoleHubView } from "./role-hub-view";
import { StandardsLibraryView } from "./standards-library-view";
import { SubmissionStatusView } from "./submission-status-view";

export const PortalPageClient = ({ slug }: { slug: PortalSlug }) => {
  const { bundle, standards, externalHandoff, isHydrated } = useAssessment();
  const { role } = useRoleSession();

  if (!isHydrated) {
    return (
      <section className="decision-surface mx-auto max-w-4xl">
        <div className="px-6 py-8 sm:px-8">
          <div className="portal-label">تهيئة Meyar Core</div>
          <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[44px]">
            نجهز الحالة الحالية
          </div>
          <div className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            إذا وصلت من بوابة خارجية فسيتم ربط الحالة هنا تلقائيًا. ويمكنك أيضًا الرجوع إلى بوابة
            الدخول ثم متابعة المسار المقصود.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/external" className="decision-cta px-5 py-3 text-sm font-semibold">
              العودة إلى الأدوار
            </Link>
            <Link
              href="/home"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
            >
              افتح مساحة القرار
            </Link>
          </div>
        </div>
      </section>
    );
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

  if (slug === "new-case") {
    return <NewCaseIntakeView />;
  }

  if (slug === "submission-status") {
    return <SubmissionStatusView />;
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
