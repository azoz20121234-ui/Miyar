import type { AppRole } from "./role-model";

export type StandardsCategory =
  | "platform-accessibility"
  | "assessment-core"
  | "governance";

export type StandardsOwnerRole = Extract<
  AppRole,
  "assessor" | "hiring-manager" | "compliance-reviewer" | "platform-admin"
>;

export type StandardsAlignmentType =
  | "مبني على"
  | "متسق مع"
  | "منظّم وفق";

export type StandardsLibraryStatus = "نشط" | "أدلة معلّقة";

export type EvidenceType =
  | "platform-review"
  | "job-definition"
  | "task-map"
  | "capability-evidence"
  | "barrier-evidence"
  | "accommodation-plan"
  | "decision-trace"
  | "governance-proof";

export type CaseCheckStatus =
  | "passed"
  | "needs-review"
  | "missing-evidence"
  | "blocker";

export type EvidenceStatus = "present" | "missing";

export interface StandardCheckDefinition {
  id: string;
  label: string;
  description: string;
  scoreImpact: number;
  blocker: boolean;
  evidenceType: EvidenceType;
  responsibleRole: StandardsOwnerRole;
  mappingKey: string;
  evidencePlaceholders: string[];
}

export interface StandardDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  category: StandardsCategory;
  domain: string;
  type: StandardsAlignmentType;
  level: string;
  ownerRole: StandardsOwnerRole;
  status: StandardsLibraryStatus;
  checkItems: StandardCheckDefinition[];
}

export interface StandardLibraryRow {
  id: string;
  code: string;
  title: string;
  category: string;
  level: string;
  ownerRole: StandardsOwnerRole;
  status: StandardsLibraryStatus;
  type: StandardsAlignmentType;
  checksCount: number;
}

export interface StandardCheckResult {
  standardId: string;
  standardCode: string;
  standardTitle: string;
  category: StandardsCategory;
  categoryLabel: string;
  domain: string;
  level: string;
  checkId: string;
  label: string;
  description: string;
  ownerRole: StandardsOwnerRole;
  blocker: boolean;
  status: CaseCheckStatus;
  evidenceStatus: EvidenceStatus;
  evidenceType: EvidenceType;
  evidenceSummary: string;
  rationale: string;
  scoreImpact: number;
  impactLabel: string;
  linkedArtifacts: string[];
  evidencePlaceholders: string[];
}

export interface StandardsOverview {
  totalStandards: number;
  totalChecks: number;
  completedChecks: number;
  completionRate: number;
  blockers: number;
  lastUpdated: string;
}

export interface EvidenceRequirement {
  id: string;
  label: string;
  standardCode: string;
  ownerRole: StandardsOwnerRole;
  status: EvidenceStatus;
  evidenceSummary: string;
  impactLabel: string;
}

export interface StandardsBlocker {
  id: string;
  title: string;
  ownerRole: StandardsOwnerRole;
  rationale: string;
  evidenceSummary: string;
}

export interface CaseStandardsEvaluation {
  overview: StandardsOverview;
  libraryRows: StandardLibraryRow[];
  checks: StandardCheckResult[];
  evidenceRequirements: EvidenceRequirement[];
  blockers: StandardsBlocker[];
  counts: Record<CaseCheckStatus, number>;
  ownerCounts: Record<StandardsOwnerRole, number>;
}
