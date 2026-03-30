"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

import { defaultLibrary, demoCapabilityProfile, demoJob } from "@/data/demo-case";
import { roleCatalog } from "@/data/roles";
import { buildAssessmentBundle } from "@/lib/scoring";
import { Accommodation, CapabilityProfile, Job } from "@/models/types";

interface AssessmentContextValue {
  job: Job;
  profile: CapabilityProfile;
  library: Accommodation[];
  roleCatalog: Job[];
  bundle: ReturnType<typeof buildAssessmentBundle>;
  selectRoleTemplate: (jobId: string) => void;
  toggleTaskEssential: (taskId: string) => void;
  toggleTaskAdaptable: (taskId: string) => void;
  setEnvironmentField: <
    K extends keyof Job["environment"]
  >(
    field: K,
    value: Job["environment"][K]
  ) => void;
  updateDimensionScore: (dimensionId: string, delta: number) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "miyar-demo-assessment";

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const cloneJob = (jobId?: string): Job =>
  JSON.parse(
    JSON.stringify(roleCatalog.find((role) => role.id === jobId) ?? demoJob)
  ) as Job;
const cloneProfile = (): CapabilityProfile =>
  JSON.parse(JSON.stringify(demoCapabilityProfile)) as CapabilityProfile;

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [job, setJob] = useState<Job>(cloneJob);
  const [profile, setProfile] = useState<CapabilityProfile>(cloneProfile);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { job: Job; profile: CapabilityProfile };
      setJob(parsed.job ?? cloneJob());
      setProfile(parsed.profile ?? cloneProfile());
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ job, profile }));
  }, [job, profile]);

  const toggleTaskEssential = (taskId: string) => {
    setJob((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              essential: !task.essential,
              taskTier: task.essential ? "secondary" : "essential"
            }
          : task
      )
    }));
  };

  const selectRoleTemplate = (jobId: string) => {
    setJob(cloneJob(jobId));
  };

  const toggleTaskAdaptable = (taskId: string) => {
    setJob((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, adaptable: !task.adaptable } : task
      )
    }));
  };

  const setEnvironmentField: AssessmentContextValue["setEnvironmentField"] = (field, value) => {
    setJob((current) => ({
      ...current,
      environment: {
        ...current.environment,
        [field]: value
      }
    }));
  };

  const updateDimensionScore = (dimensionId: string, delta: number) => {
    setProfile((current) => ({
      ...current,
      dimensions: current.dimensions.map((dimension) =>
        dimension.id === dimensionId
          ? {
              ...dimension,
              score: Math.max(20, Math.min(98, dimension.score + delta))
            }
          : dimension
      )
    }));
  };

  const resetDemo = () => {
    setJob(cloneJob());
    setProfile(cloneProfile());
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const bundle = buildAssessmentBundle(job, profile, defaultLibrary, roleCatalog);

  return (
    <AssessmentContext.Provider
      value={{
        job,
        profile,
        library: defaultLibrary,
        roleCatalog,
        bundle,
        selectRoleTemplate,
        toggleTaskEssential,
        toggleTaskAdaptable,
        setEnvironmentField,
        updateDimensionScore,
        resetDemo
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);

  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider");
  }

  return context;
};
