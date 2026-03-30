import { roleCatalog as defaultRoleCatalog } from "@/data/roles";
import {
  Accommodation,
  AssessmentBundle,
  CapabilityProfile,
  Job,
  ReadinessReport,
  SuitabilityStatus
} from "@/models/types";

import { buildAccommodationPlan } from "./accommodation-engine";
import { detectBarriers } from "./barrier-engine";
import { buildReadinessReport, estimateBaselineReadiness } from "./report-engine";
import {
  buildDimensionScores,
  buildEnvironmentExplainability,
  buildTaskResults,
  calculateCriticalCoverage,
  calculateTaskFit,
  scoreEnvironment
} from "./task-engine";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const evaluateRole = (job: Job, profile: CapabilityProfile, library: Accommodation[]) => {
  const taskResults = buildTaskResults(job, profile);
  const environmentFit = scoreEnvironment(job, profile);
  const environmentExplainability = buildEnvironmentExplainability(job, profile);
  const barriers = detectBarriers(job, profile, taskResults);
  const baselineReadiness = estimateBaselineReadiness(
    calculateTaskFit(taskResults),
    environmentFit,
    calculateCriticalCoverage(taskResults),
    barriers
  );
  const plan = buildAccommodationPlan(job, barriers, library, baselineReadiness);
  const report = buildReadinessReport(job, profile, taskResults, barriers, plan, environmentFit);
  const dimensionScores = buildDimensionScores(profile, environmentFit);

  return {
    job,
    profile,
    taskResults,
    barriers,
    plan,
    report,
    dimensionScores,
    environmentExplainability
  };
};

export const buildAssessmentBundle = (
  job: Job,
  profile: CapabilityProfile,
  library: Accommodation[],
  roleCatalog: Job[] = defaultRoleCatalog
): AssessmentBundle => {
  const assessment = evaluateRole(job, profile, library);
  const roleCatalogPreviews = roleCatalog
    .map((role) => {
      const preview = evaluateRole(role, profile, library);
      const topSignal = preview.report.signals.sort((left, right) => {
        const leftScore =
          left.direction === "higher-better" ? left.score : 100 - left.score;
        const rightScore =
          right.direction === "higher-better" ? right.score : 100 - right.score;
        return rightScore - leftScore;
      })[0];

      return {
        jobId: role.id,
        title: role.title,
        family: role.family,
        readiness: preview.report.finalReadiness,
        status: preview.report.status,
        confidence: preview.report.confidence,
        topSignal: topSignal?.label ?? "No signal"
      };
    })
    .sort((left, right) => right.readiness - left.readiness);

  return {
    ...assessment,
    roleCatalog,
    roleCatalogPreviews
  };
};

export const statusLabel = (status: SuitabilityStatus) => {
  if (status === "fit") return "مناسب";
  if (status === "conditional") return "مناسب بعد التهيئة";
  if (status === "needs-preparation") return "يحتاج تهيئة إضافية";
  return "غير مناسب حاليًا";
};

export const statusTone = (status: SuitabilityStatus) => {
  if (status === "fit") return "success";
  if (status === "conditional") return "warning";
  if (status === "needs-preparation") return "warning";
  return "danger";
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(value);

export const formatCurrencyRange = (range: { min: number; max: number }) =>
  `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;

export const bandTone = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 65) return "warning";
  return "danger";
};

export const bandToneForSignal = (
  score: number,
  direction: ReadinessReport["signals"][number]["direction"]
) => {
  const normalized = direction === "higher-better" ? score : clamp(100 - score);
  return bandTone(normalized);
};

export const changeVolumeLabel = (value: AssessmentBundle["plan"]["changeVolume"]) => {
  if (value === "limited") return "محدود";
  if (value === "moderate") return "متوسط";
  return "مادي";
};
