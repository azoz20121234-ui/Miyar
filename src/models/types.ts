export type SuitabilityStatus =
  | "fit"
  | "conditional"
  | "needs-preparation"
  | "not-ready";

export type BarrierSeverity = "low" | "medium" | "high";
export type AccommodationCategory = "software" | "process" | "physical";
export type FitLevel = "strong" | "partial" | "gap";
export type TaskTier = "essential" | "secondary";
export type TaskFrequency = "continuous" | "daily" | "weekly" | "event-based";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type CommunicationPattern = "written-first" | "mixed" | "verbal-heavy";
export type DocumentFormat = "structured-digital" | "mixed" | "scan-heavy";
export type MeetingLoad = "limited" | "moderate" | "heavy";
export type AccessibilityMaturity = "basic" | "managed" | "advanced";
export type LocalReadinessFlag = "ready" | "conditional" | "limited";
export type ImplementationEffort = "light" | "moderate" | "heavy";
export type InvestmentClass = "quick-win" | "medium" | "capital";
export type SummaryTone = "positive" | "watch" | "risk";
export type SignalDirection = "higher-better" | "lower-better";

export interface CostRange {
  min: number;
  max: number;
  midpoint: number;
}

export interface AtomicTask {
  id: string;
  title: string;
  category: string;
  description: string;
  taskTier: TaskTier;
  essential: boolean;
  frequency: TaskFrequency;
  durationMinutes: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  visualSensitivity: number;
  auditorySensitivity: number;
  fineMotorRequirement: number;
  grossMotorRequirement: number;
  cognitiveRequirement: number;
  communicationRequirement: number;
  digitalNavigationRequirement: number;
  workTool: string;
  adaptable: boolean;
  redistributionPotential: "none" | "partial" | "high";
  notes: string;
}

export interface WorkEnvironment {
  id: string;
  mode: WorkMode;
  lighting: "controlled" | "standard" | "high-glare";
  noiseLevel: "low" | "moderate" | "high";
  mobilityDemand: "low" | "moderate" | "high";
  accessibilityMaturity: AccessibilityMaturity;
  communicationPattern: CommunicationPattern;
  meetingLoad: MeetingLoad;
  documentFormat: DocumentFormat;
  workspacePace: "steady" | "variable" | "high-velocity";
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
  assessmentConfidence: number;
  dimensions: CapabilityDimension[];
  preferredModes: string[];
  toolsMastery: string[];
  workConditions: string[];
  operationalStrengths: string[];
  constraints: string[];
}

export interface Barrier {
  id: string;
  title: string;
  type: "task" | "environment" | "tool" | "communication";
  severity: BarrierSeverity;
  summary: string;
  whyDetected: string;
  evidence: string[];
  affectedTaskIds: string[];
  scoreImpact: number;
  confidence: number;
  targetAccommodationIds: string[];
  residualRiskIfIgnored: string;
}

export interface Accommodation {
  id: string;
  name: string;
  category: AccommodationCategory;
  description: string;
  targetBarrierIds: string[];
  supportedTaskIds: string[];
  expectedEffectiveness: number;
  implementationEffort: ImplementationEffort;
  estimatedCostRangeSar: CostRange;
  estimatedTimeToImplementDays: number;
  dependencyRequirements: string[];
  localReadinessFlag: LocalReadinessFlag;
  priorityLevel: "critical" | "high" | "medium";
  investmentClass: InvestmentClass;
}

export interface AccommodationPlanItem {
  accommodationId: string;
  name: string;
  category: AccommodationCategory;
  whyRecommended: string;
  linkedBarrierIds: string[];
  linkedTaskIds: string[];
  estimatedCostRangeSar: CostRange;
  implementationEffort: ImplementationEffort;
  implementationDays: number;
  expectedEffectiveness: number;
  expectedReadinessLift: number;
  localReadinessFlag: LocalReadinessFlag;
  priorityLevel: "critical" | "high" | "medium";
  investmentClass: InvestmentClass;
  dependencyRequirements: string[];
  readinessBefore: number;
  readinessAfter: number;
  confidence: number;
}

export interface AccommodationPlan {
  id: string;
  totalCostSar: number;
  totalCostRangeSar: CostRange;
  maxImplementationDays: number;
  changeVolume: "limited" | "moderate" | "material";
  items: AccommodationPlanItem[];
  barrierCoverage: number;
  feasibilityScore: number;
  totalExpectedLift: number;
  confidence: number;
}

export interface TaskFitResult {
  taskId: string;
  title: string;
  taskTier: TaskTier;
  frequency: TaskFrequency;
  durationMinutes: number;
  intensity: number;
  workTool: string;
  adaptable: boolean;
  redistributionPotential: AtomicTask["redistributionPotential"];
  contributionWeight: number;
  score: number;
  fitLevel: FitLevel;
  gapSummary: string;
  reasons: string[];
  certainty: number;
  blockerCodes: string[];
}

export interface DimensionScore {
  label: string;
  score: number;
}

export interface ComplianceSignal {
  id: string;
  label: string;
  score: number;
  tone: SummaryTone;
  direction: SignalDirection;
  rationale: string;
}

export interface ExecutiveChecklistItem {
  id: string;
  label: string;
  rationale: string;
  owner: string;
  priority: "required" | "recommended";
}

export interface ReportHighlight {
  title: string;
  summary: string;
}

export interface ReadinessReport {
  id: string;
  status: SuitabilityStatus;
  taskFit: number;
  environmentFit: number;
  accommodationFeasibility: number;
  baselineReadiness: number;
  finalReadiness: number;
  readinessDelta: number;
  criticalCoverage: number;
  confidence: number;
  riskLevel: BarrierSeverity;
  residualRiskLevel: BarrierSeverity;
  recommendation: string;
  executiveSummary: string;
  whyThisDecision: string;
  decisionRationale: string[];
  topBarriers: ReportHighlight[];
  topActions: ReportHighlight[];
  totalCostRangeSar: CostRange;
  maxImplementationDays: number;
  checklist: ExecutiveChecklistItem[];
  signals: ComplianceSignal[];
}

export interface RoleCatalogPreview {
  jobId: string;
  title: string;
  family: string;
  readiness: number;
  status: SuitabilityStatus;
  confidence: number;
  topSignal: string;
}

export interface AssessmentBundle {
  job: Job;
  profile: CapabilityProfile;
  roleCatalog: Job[];
  taskResults: TaskFitResult[];
  barriers: Barrier[];
  plan: AccommodationPlan;
  report: ReadinessReport;
  dimensionScores: DimensionScore[];
  environmentExplainability: string[];
  roleCatalogPreviews: RoleCatalogPreview[];
}

export interface PipelineCase {
  id: string;
  company: string;
  roleTitle: string;
  statusLabel: string;
  readiness: number;
  costSar: number;
  owner: string;
  confidence?: number;
}
