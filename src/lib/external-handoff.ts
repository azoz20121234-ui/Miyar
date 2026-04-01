export type ExternalJobComplexity = "low" | "medium" | "high";
export type ExpectedAccommodationLevel = "low" | "medium" | "high";

export interface ExternalCandidate {
  capabilityScore: number;
  strengths: string[];
  limitations: string[];
  preferences: string[];
  evidence: string[];
}

export interface ExternalJob {
  title: string;
  complexity: ExternalJobComplexity;
  criticalTasks: string[];
  adaptableTasks: string[];
  risks: string[];
}

export interface ExternalHandoffInput {
  candidate: ExternalCandidate;
  job: ExternalJob;
}

export interface ExternalHandoffRecord extends ExternalHandoffInput {
  createdAt: string;
  createdFromExternal: true;
  expectedAccommodationLevel: ExpectedAccommodationLevel;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const splitExternalList = (value: string) =>
  value
    .split(/\n|،|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const joinExternalList = (items: string[]) => items.join("\n");

export const calculateCandidateCapabilityScore = (
  candidate: Pick<ExternalCandidate, "strengths" | "limitations" | "preferences" | "evidence">
) => {
  const strengthsLift = Math.min(24, candidate.strengths.length * 6);
  const preferencesLift = Math.min(12, candidate.preferences.length * 3);
  const evidenceLift = Math.min(8, candidate.evidence.length * 2);
  const limitationsPenalty = Math.min(20, candidate.limitations.length * 5);

  return clamp(58 + strengthsLift + preferencesLift + evidenceLift - limitationsPenalty, 35, 94);
};

export const complexityLabelMap: Record<ExternalJobComplexity, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع"
};

export const accommodationLevelLabelMap: Record<ExpectedAccommodationLevel, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع"
};

export const calculateExpectedAccommodationLevel = (
  candidate: ExternalCandidate,
  job: ExternalJob
): ExpectedAccommodationLevel => {
  let score =
    job.complexity === "high" ? 3 : job.complexity === "medium" ? 2 : 1;

  if (job.risks.length >= 3) score += 1;
  if (candidate.capabilityScore <= 64) score += 1;
  if (candidate.capabilityScore >= 80) score -= 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
};

export const buildExternalHandoffRecord = (
  input: ExternalHandoffInput
): ExternalHandoffRecord => ({
  candidate: {
    ...input.candidate,
    capabilityScore: calculateCandidateCapabilityScore(input.candidate)
  },
  job: input.job,
  createdAt: new Date().toISOString(),
  createdFromExternal: true,
  expectedAccommodationLevel: calculateExpectedAccommodationLevel(
    {
      ...input.candidate,
      capabilityScore: calculateCandidateCapabilityScore(input.candidate)
    },
    input.job
  )
});

export const hasExternalHandoffData = (
  handoff: ExternalHandoffRecord | null | undefined
): handoff is ExternalHandoffRecord =>
  Boolean(
    handoff &&
      handoff.createdFromExternal &&
      handoff.candidate &&
      handoff.job &&
      handoff.job.title.trim().length > 0
  );

export const isExternalHandoffInput = (
  value: unknown
): value is ExternalHandoffInput => {
  if (!value || typeof value !== "object") return false;

  const record = value as ExternalHandoffInput;

  return Boolean(
    record.candidate &&
      record.job &&
      Array.isArray(record.candidate.strengths) &&
      Array.isArray(record.candidate.limitations) &&
      Array.isArray(record.candidate.preferences) &&
      Array.isArray(record.candidate.evidence) &&
      typeof record.job.title === "string" &&
      Array.isArray(record.job.criticalTasks) &&
      Array.isArray(record.job.adaptableTasks) &&
      Array.isArray(record.job.risks)
  );
};
