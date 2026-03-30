import { standardsCatalog } from "@/data/standards-catalog";
import { standardsMapping } from "@/data/standards-mapping";
import { getRoleConfig } from "@/lib/role-model";
import { AssessmentBundle } from "@/models/types";

import {
  CaseStandardsEvaluation,
  StandardCheckResult,
  StandardsCategory
} from "./standards-types";

const LAST_UPDATED = "30 مارس 2026";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const categoryLabelMap: Record<StandardsCategory, string> = {
  "platform-accessibility": "Platform Accessibility",
  "assessment-core": "Assessment Core",
  governance: "Governance"
};

const impactLabel = (scoreImpact: number) => {
  if (scoreImpact >= 11) return "عالٍ";
  if (scoreImpact >= 8) return "متوسط";
  return "منخفض";
};

export const buildStandardsEvaluation = (
  bundle: AssessmentBundle
): CaseStandardsEvaluation => {
  const libraryRows = standardsCatalog.map((standard) => ({
    id: standard.id,
    code: standard.code,
    title: standard.title,
    category: categoryLabelMap[standard.category],
    level: standard.level,
    ownerRole: standard.ownerRole,
    status: standard.status,
    type: standard.type,
    checksCount: standard.checkItems.length
  }));

  const checks: StandardCheckResult[] = standardsCatalog.flatMap((standard) =>
    standard.checkItems.map((check) => {
      const mapping = standardsMapping[check.mappingKey];
      const result = mapping.evaluate(bundle);

      return {
        standardId: standard.id,
        standardCode: standard.code,
        standardTitle: standard.title,
        category: standard.category,
        categoryLabel: categoryLabelMap[standard.category],
        domain: standard.domain,
        level: standard.level,
        checkId: check.id,
        label: check.label,
        description: check.description,
        ownerRole: check.responsibleRole,
        blocker: check.blocker,
        status: result.status,
        evidenceStatus: result.evidenceStatus,
        evidenceType: check.evidenceType,
        evidenceSummary: result.evidenceSummary,
        rationale: result.rationale,
        scoreImpact: check.scoreImpact,
        impactLabel: impactLabel(check.scoreImpact),
        linkedArtifacts: mapping.linkedArtifacts,
        evidencePlaceholders: check.evidencePlaceholders
      };
    })
  );

  const counts = checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    {
      passed: 0,
      "needs-review": 0,
      "missing-evidence": 0,
      blocker: 0
    }
  );

  const ownerCounts = checks.reduce(
    (acc, check) => {
      acc[check.ownerRole] += check.status === "passed" ? 0 : 1;
      return acc;
    },
    {
      assessor: 0,
      "hiring-manager": 0,
      "compliance-reviewer": 0,
      "platform-admin": 0
    }
  );

  const completedChecks = counts.passed;
  const overview = {
    totalStandards: libraryRows.length,
    totalChecks: checks.length,
    completedChecks,
    completionRate: clamp((completedChecks / Math.max(checks.length, 1)) * 100),
    blockers: checks.filter((check) => check.blocker && check.status !== "passed").length,
    lastUpdated: LAST_UPDATED
  };

  const evidenceRequirements = checks
    .filter((check) => check.evidenceStatus === "missing")
    .slice(0, 8)
    .map((check) => ({
      id: check.checkId,
      label: check.label,
      standardCode: check.standardCode,
      ownerRole: check.ownerRole,
      status: check.evidenceStatus,
      evidenceSummary: check.evidenceSummary,
      impactLabel: check.impactLabel
    }));

  const blockers = checks
    .filter((check) => check.blocker && check.status !== "passed")
    .map((check) => ({
      id: check.checkId,
      title: `${check.standardCode} • ${check.label}`,
      ownerRole: check.ownerRole,
      rationale: check.rationale,
      evidenceSummary: check.evidenceSummary
    }));

  return {
    overview,
    libraryRows,
    checks,
    evidenceRequirements,
    blockers,
    counts,
    ownerCounts
  };
};

export const standardsTone = (
  status: StandardCheckResult["status"] | "active"
): "success" | "warning" | "danger" | "neutral" => {
  if (status === "passed" || status === "active") return "success";
  if (status === "needs-review") return "warning";
  if (status === "missing-evidence" || status === "blocker") return "danger";
  return "neutral";
};

export const standardsOwnerLabel = (role: StandardCheckResult["ownerRole"]) =>
  getRoleConfig(role).label;
