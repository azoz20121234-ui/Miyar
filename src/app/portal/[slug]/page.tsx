import { notFound } from "next/navigation";

import { PortalPageClient } from "@/components/portal-page-client";
import { portalSlugs, type PortalSlug } from "@/lib/role-model";

export function generateStaticParams() {
  return portalSlugs.map((slug) => ({ slug }));
}

export default function PortalPage({
  params
}: {
  params: { slug: string };
}) {
  const slug = params.slug as PortalSlug;

  if (!portalSlugs.includes(slug)) {
    notFound();
  }

  return <PortalPageClient slug={slug} />;
}
