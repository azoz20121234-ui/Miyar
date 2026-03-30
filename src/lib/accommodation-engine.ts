import {
  Accommodation,
  AccommodationPlan,
  AccommodationPlanItem,
  Barrier,
  Job
} from "@/models/types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const sumRange = (ranges: Array<{ min: number; max: number; midpoint: number }>) => ({
  min: ranges.reduce((sum, item) => sum + item.min, 0),
  max: ranges.reduce((sum, item) => sum + item.max, 0),
  midpoint: ranges.reduce((sum, item) => sum + item.midpoint, 0)
});

const severityWeight: Record<Barrier["severity"], number> = {
  low: 16,
  medium: 24,
  high: 34
};

const readinessWeight: Record<Accommodation["localReadinessFlag"], number> = {
  ready: 10,
  conditional: 5,
  limited: -4
};

const effortPenalty: Record<Accommodation["implementationEffort"], number> = {
  light: 0,
  moderate: 5,
  heavy: 11
};

const priorityWeight: Record<Accommodation["priorityLevel"], number> = {
  critical: 12,
  high: 7,
  medium: 3
};

const investmentWeight: Record<Accommodation["investmentClass"], number> = {
  "quick-win": 5,
  medium: 2,
  capital: -4
};

type Candidate = {
  accommodation: Accommodation;
  barrierIds: string[];
  taskIds: string[];
  score: number;
  readinessLift: number;
  confidence: number;
};

const intersect = (left: string[], right: string[]) => left.filter((item) => right.includes(item));

const buildCandidate = (
  accommodation: Accommodation,
  barrier: Barrier,
  baselineReadiness: number
): Candidate => {
  const overlapTasks = intersect(barrier.affectedTaskIds, accommodation.supportedTaskIds);
  const overlapRatio = barrier.affectedTaskIds.length
    ? overlapTasks.length / barrier.affectedTaskIds.length
    : 0;

  const score =
    severityWeight[barrier.severity] +
    overlapRatio * 18 +
    accommodation.expectedEffectiveness * 0.42 +
    readinessWeight[accommodation.localReadinessFlag] +
    priorityWeight[accommodation.priorityLevel] +
    investmentWeight[accommodation.investmentClass] -
    effortPenalty[accommodation.implementationEffort];

  const readinessLift = Math.max(
    3,
    Math.round((barrier.scoreImpact * (accommodation.expectedEffectiveness / 100) * (0.72 + overlapRatio * 0.28)) / 2.1)
  );

  const confidence = clamp((barrier.confidence * 0.45 + accommodation.expectedEffectiveness * 0.35 + 20) / 1.1);

  return {
    accommodation,
    barrierIds: [barrier.id],
    taskIds: overlapTasks.length ? overlapTasks : barrier.affectedTaskIds.slice(0, 2),
    score: score + Math.max(0, (100 - baselineReadiness) * 0.05),
    readinessLift,
    confidence
  };
};

const mergeCandidates = (target: Candidate, barrier: Barrier) => ({
  ...target,
  barrierIds: Array.from(new Set([...target.barrierIds, barrier.id])),
  taskIds: Array.from(new Set([...target.taskIds, ...barrier.affectedTaskIds])),
  score: target.score + barrier.scoreImpact * 0.35,
  readinessLift: target.readinessLift + Math.max(1, Math.round(barrier.scoreImpact * 0.16)),
  confidence: clamp((target.confidence + barrier.confidence) / 2)
});

export const buildAccommodationPlan = (
  job: Job,
  barriers: Barrier[],
  library: Accommodation[],
  baselineReadiness: number
): AccommodationPlan => {
  const selected = new Map<string, Candidate>();

  barriers.forEach((barrier) => {
    const candidates = library
      .filter((accommodation) => accommodation.targetBarrierIds.includes(barrier.id))
      .map((accommodation) => buildCandidate(accommodation, barrier, baselineReadiness))
      .sort((left, right) => right.score - left.score);

    const primary = candidates[0];
    if (!primary) {
      return;
    }

    if (selected.has(primary.accommodation.id)) {
      selected.set(
        primary.accommodation.id,
        mergeCandidates(selected.get(primary.accommodation.id) as Candidate, barrier)
      );
    } else {
      selected.set(primary.accommodation.id, primary);
    }

    if (
      barrier.id === "document-review" &&
      job.environment.documentFormat === "scan-heavy"
    ) {
      const processCandidate = candidates.find(
        (candidate) =>
          candidate.accommodation.category === "process" &&
          candidate.accommodation.id !== primary.accommodation.id
      );

      if (processCandidate && !selected.has(processCandidate.accommodation.id)) {
        selected.set(processCandidate.accommodation.id, processCandidate);
      }
    }
  });

  const sortedCandidates = Array.from(selected.values())
    .sort((left, right) => {
      const priorityDelta =
        priorityWeight[right.accommodation.priorityLevel] -
        priorityWeight[left.accommodation.priorityLevel];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.readinessLift - left.readinessLift;
    })
    .slice(0, 5);

  let runningReadiness = baselineReadiness;
  const items: AccommodationPlanItem[] = sortedCandidates.map((candidate, index) => {
      const readinessBefore = clamp(runningReadiness);
      const readinessAfter = clamp(readinessBefore + candidate.readinessLift);
      runningReadiness = readinessAfter;

      return {
        accommodationId: candidate.accommodation.id,
        name: candidate.accommodation.name,
        category: candidate.accommodation.category,
        whyRecommended:
          candidate.barrierIds.length > 1
            ? `اقتُرح هذا التكييف لأنه يغطي أكثر من عائق تشغيلي واحد ويؤثر مباشرة على ${candidate.barrierIds.length} أسباب قرار.`
            : "اقتُرح هذا التكييف لأنه يعالج العائق التشغيلي مباشرة عند نقطة التنفيذ الفعلية، لا على مستوى وصفي عام.",
        linkedBarrierIds: candidate.barrierIds,
        linkedTaskIds: candidate.taskIds,
        estimatedCostRangeSar: candidate.accommodation.estimatedCostRangeSar,
        implementationEffort: candidate.accommodation.implementationEffort,
        implementationDays: candidate.accommodation.estimatedTimeToImplementDays,
        expectedEffectiveness: candidate.accommodation.expectedEffectiveness,
        expectedReadinessLift: candidate.readinessLift,
        localReadinessFlag: candidate.accommodation.localReadinessFlag,
        priorityLevel: candidate.accommodation.priorityLevel,
        investmentClass: candidate.accommodation.investmentClass,
        dependencyRequirements: candidate.accommodation.dependencyRequirements,
        readinessBefore,
        readinessAfter,
        confidence: clamp(candidate.confidence - index)
      };
    });

  const totalCostRangeSar = sumRange(items.map((item) => item.estimatedCostRangeSar));
  const totalCostSar = totalCostRangeSar.midpoint;
  const maxImplementationDays = items.reduce(
    (maxDays, item) => Math.max(maxDays, item.implementationDays),
    0
  );
  const coveredBarrierIds = new Set(items.flatMap((item) => item.linkedBarrierIds));
  const barrierCoverage = barriers.length
    ? clamp((coveredBarrierIds.size / barriers.length) * 100)
    : 100;

  let changeVolume: AccommodationPlan["changeVolume"] = "limited";
  if (items.length >= 4 || totalCostRangeSar.midpoint >= 6500) {
    changeVolume = "moderate";
  }
  if (items.length >= 5 || totalCostRangeSar.midpoint >= 9800) {
    changeVolume = "material";
  }

  const feasibilityScore = clamp(
    88 -
      Math.max(0, totalCostRangeSar.midpoint - 6000) / 420 -
      Math.max(0, maxImplementationDays - 5) * 2 -
      (changeVolume === "material" ? 9 : changeVolume === "moderate" ? 4 : 0) +
      averageReadiness(items)
  );

  const confidence = clamp(
    items.length
      ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length
      : 72
  );

  return {
    id: "plan-saudi-office-01",
    totalCostSar,
    totalCostRangeSar,
    maxImplementationDays,
    changeVolume,
    items,
    barrierCoverage,
    feasibilityScore,
    totalExpectedLift: items.reduce((sum, item) => sum + item.expectedReadinessLift, 0),
    confidence
  };
};

const averageReadiness = (items: AccommodationPlanItem[]) =>
  items.length
    ? items.reduce((sum, item) => {
        const bonus =
          item.localReadinessFlag === "ready"
            ? 1.8
            : item.localReadinessFlag === "conditional"
              ? 0.8
              : -1.2;
        return sum + bonus;
      }, 0)
    : 0;
