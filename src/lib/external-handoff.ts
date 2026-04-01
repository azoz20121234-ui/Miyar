export interface CandidateIntake {
  start: {
    fullName: string;
    city: string;
    targetRole: string;
  };
  capabilities: {
    digitalNavigation: string;
    writtenCommunication: string;
    documentHandling: string;
    keyboardUse: string;
  };
  evidence: {
    workSample: string;
    toolsUsed: string;
    supportEvidence: string;
  };
  preferences: {
    workMode: string;
    supportTools: string;
    scheduleNotes: string;
    contactPreference: string;
  };
}

export interface EmployerIntake {
  start: {
    companyName: string;
    ownerName: string;
    roleTitle: string;
  };
  jobBreakdown: {
    rolePurpose: string;
    coreTasks: string;
    tools: string;
  };
  requirements: {
    mustHave: string;
    communicationPattern: string;
    workMode: string;
  };
  risks: {
    operationalRisks: string;
    reviewPoints: string;
    blockers: string;
  };
  accommodations: {
    currentSupport: string;
    openAdjustments: string;
    budgetNotes: string;
  };
}

export interface ExternalHandoffPayload {
  candidateName: string;
  candidateCity: string;
  candidateTargetRole: string;
  primaryCapabilities: string[];
  completedEvidence: string[];
  preferences: string[];
  jobTitle: string;
  employerName: string;
  caseOwnerName: string;
  jobPurpose: string;
  coreTasks: string[];
  workTools: string[];
  jobRequirements: string[];
  proposedAccommodations: string[];
  initialReadiness: number;
  initialReadinessLabel: string;
}

const compactList = (value: string) =>
  value
    .split(/\n|،|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueList = (items: string[]) => Array.from(new Set(items));

export const buildExternalHandoff = (
  candidate: CandidateIntake,
  employer: EmployerIntake
): ExternalHandoffPayload => {
  const primaryCapabilities = uniqueList([
    candidate.capabilities.digitalNavigation,
    candidate.capabilities.writtenCommunication,
    candidate.capabilities.documentHandling,
    candidate.capabilities.keyboardUse
  ]).slice(0, 4);

  const completedEvidence = uniqueList([
    candidate.evidence.workSample,
    candidate.evidence.toolsUsed,
    candidate.evidence.supportEvidence
  ]).slice(0, 3);

  const preferences = uniqueList([
    candidate.preferences.workMode,
    candidate.preferences.supportTools,
    candidate.preferences.scheduleNotes,
    candidate.preferences.contactPreference
  ]).slice(0, 4);

  const coreTasks = uniqueList(compactList(employer.jobBreakdown.coreTasks)).slice(0, 5);
  const workTools = uniqueList(compactList(employer.jobBreakdown.tools)).slice(0, 5);
  const jobRequirements = uniqueList([
    ...compactList(employer.requirements.mustHave),
    employer.requirements.communicationPattern,
    employer.requirements.workMode
  ]).slice(0, 5);

  const proposedAccommodations = uniqueList([
    ...compactList(candidate.preferences.supportTools),
    ...compactList(employer.accommodations.openAdjustments),
    ...compactList(employer.accommodations.currentSupport)
  ]).slice(0, 5);

  const evidenceScore = Math.min(12, completedEvidence.length * 4);
  const accommodationScore = Math.min(10, proposedAccommodations.length * 2);
  const taskScore = Math.min(10, coreTasks.length * 2);
  const readiness = Math.max(58, Math.min(82, 56 + evidenceScore + accommodationScore + taskScore));

  const initialReadinessLabel =
    readiness >= 76
      ? "جاهزية أولية قوية"
      : readiness >= 68
        ? "جاهزية أولية جيدة"
        : "جاهزية أولية تحتاج استكمال";

  return {
    candidateName: candidate.start.fullName,
    candidateCity: candidate.start.city,
    candidateTargetRole: candidate.start.targetRole,
    primaryCapabilities,
    completedEvidence,
    preferences,
    jobTitle: employer.start.roleTitle,
    employerName: employer.start.companyName,
    caseOwnerName: employer.start.ownerName,
    jobPurpose: employer.jobBreakdown.rolePurpose,
    coreTasks,
    workTools,
    jobRequirements,
    proposedAccommodations,
    initialReadiness: readiness,
    initialReadinessLabel
  };
};
