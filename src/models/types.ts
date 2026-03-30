export type SuitabilityStatus =
  | "fit"
  | "conditional"
  | "needs-preparation"
  | "not-ready";

export type BarrierSeverity = "low" | "medium" | "high";
export type AccommodationCategory = "software" | "process" | "physical";
export type ReadinessBand = "ready" | "moderate" | "attention";
export type FitLevel = "strong" | "partial" | "gap";

export interface TaskDemand {
  digitalPrecision: number;
  writtenCommunication: number;
  concentration: number;
  deskMobility: number;
  visualLoad: number;
}

export interface AtomicTask {
  id: string;
  title: string;
  category: string;
  description: string;
  essential: boolean;
  adaptable: boolean;
  timeShare: number;
  effortLevel: number;
  movementLevel: number;
  tools: string[];
  communicationMode: "written" | "mixed" | "minimal";
  demands: TaskDemand;
}

export interface WorkEnvironment {
  id: string;
  mode: "onsite" | "hybrid" | "remote";
  lighting: "controlled" | "standard" | "high-glare";
  noiseLevel: "low" | "moderate" | "high";
  mobilityDemand: "low" | "moderate" | "high";
  accessibilityMaturity: "basic" | "managed" | "advanced";
  communicationPattern: "written-first" | "mixed" | "verbal-heavy";
  tools: string[];
  risks: string[];
}

export interface Job {
  id: string;
  title: string;
  family: string;
  department: string;
  location: string;
  summary: string;
  outcomes: string[];
  coreSkills: string[];
  tools: string[];
  environment: WorkEnvironment;
  tasks: AtomicTask[];
}

export interface CapabilityDimension {
  id: string;
  label: string;
  score: number;
  note: string;
  evidence: string;
}

export interface CapabilityProfile {
  id: string;
  candidateAlias: string;
  targetDisability: "visual" | "hearing" | "motor-digital";
  headline: string;
  dimensions: CapabilityDimension[];
  preferredModes: string[];
  toolsMastery: string[];
  workConditions: string[];
  constraints: string[];
}

export interface Barrier {
  id: string;
  title: string;
  type: "task" | "environment" | "tool" | "communication";
  severity: BarrierSeverity;
  summary: string;
  affectedTaskIds: string[];
  accommodationIds: string[];
}

export interface Accommodation {
  id: string;
  title: string;
  category: AccommodationCategory;
  description: string;
  addresses: string[];
  costSar: number;
  timelineDays: number;
  impactScore: number;
  priority: "critical" | "high" | "medium";
}

export interface AccommodationPlanItem {
  accommodationId: string;
  title: string;
  category: AccommodationCategory;
  rationale: string;
  estimatedCostSar: number;
  implementationDays: number;
  expectedLift: number;
  priority: "critical" | "high" | "medium";
}

export interface AccommodationPlan {
  id: string;
  totalCostSar: number;
  maxImplementationDays: number;
  changeVolume: "limited" | "moderate" | "material";
  items: AccommodationPlanItem[];
}

export interface TaskFitResult {
  taskId: string;
  title: string;
  essential: boolean;
  adaptable: boolean;
  timeShare: number;
  score: number;
  fitLevel: FitLevel;
  gapSummary: string;
}

export interface DimensionScore {
  label: string;
  score: number;
}

export interface ReadinessReport {
  id: string;
  status: SuitabilityStatus;
  taskFit: number;
  environmentFit: number;
  accommodationFeasibility: number;
  finalReadiness: number;
  criticalCoverage: number;
  riskLevel: BarrierSeverity;
  recommendation: string;
  executiveSummary: string;
  keyBarriers: string[];
  topAdjustments: string[];
}

export interface AssessmentBundle {
  job: Job;
  profile: CapabilityProfile;
  taskResults: TaskFitResult[];
  barriers: Barrier[];
  plan: AccommodationPlan;
  report: ReadinessReport;
  dimensionScores: DimensionScore[];
}

export interface PipelineCase {
  id: string;
  company: string;
  roleTitle: string;
  statusLabel: string;
  readiness: number;
  costSar: number;
  owner: string;
}
