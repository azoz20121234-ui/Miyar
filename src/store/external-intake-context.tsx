"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  calculateCandidateCapabilityScore,
  ExternalCandidate,
  ExternalJob,
  ExternalJobComplexity,
  splitExternalList
} from "@/lib/external-handoff";

type CandidateListField = "strengths" | "limitations" | "preferences" | "evidence";
type JobListField = "criticalTasks" | "adaptableTasks" | "risks";

interface ExternalIntakeContextValue {
  candidate: ExternalCandidate;
  job: ExternalJob;
  hasCandidateData: boolean;
  hasJobData: boolean;
  setCandidateList: (field: CandidateListField, value: string) => void;
  setJobField: (field: "title" | "complexity", value: string) => void;
  setJobList: (field: JobListField, value: string) => void;
  resetExternalIntake: () => void;
}

const STORAGE_KEY = "meyar-external-intake";

const withCandidateScore = (
  candidate: Omit<ExternalCandidate, "capabilityScore"> | ExternalCandidate
): ExternalCandidate => ({
  ...candidate,
  capabilityScore: calculateCandidateCapabilityScore(candidate)
});

const defaultCandidate: ExternalCandidate = withCandidateScore({
  strengths: [
    "تنفيذ المهام الكتابية الرقمية بدقة",
    "العمل عبر لوحة المفاتيح بشكل مستقر",
    "الالتزام بخطوات واضحة ومتكررة"
  ],
  limitations: ["الواجهات شديدة الكثافة", "الملفات المصورة غير القابلة للقراءة"],
  preferences: ["بيئة مكتبية هادئة", "تواصل كتابي أولًا", "مسار عمل واضح"],
  evidence: ["خبرة في إدخال البيانات", "استخدام قارئ شاشة وتكبير شاشة"]
});

const defaultJob: ExternalJob = {
  title: "دعم إداري / إدخال بيانات",
  complexity: "medium",
  criticalTasks: ["إدخال البيانات", "مراجعة الجداول", "متابعة البريد"],
  adaptableTasks: ["تنسيق الملفات", "تجهيز القوالب", "المتابعات الثانوية"],
  risks: ["واجهات معقدة", "ملفات غير قابلة للقراءة", "ضغط متوسط في التحديث اليومي"]
};

const ExternalIntakeContext = createContext<ExternalIntakeContextValue | null>(null);

export const ExternalIntakeProvider = ({ children }: { children: ReactNode }) => {
  const [candidate, setCandidate] = useState<ExternalCandidate>(defaultCandidate);
  const [job, setJob] = useState<ExternalJob>(defaultJob);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as {
        candidate?: ExternalCandidate;
        job?: ExternalJob;
      };

      if (parsed.candidate) {
        setCandidate(withCandidateScore(parsed.candidate));
      }

      if (parsed.job) {
        setJob(parsed.job);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ candidate, job }));
  }, [candidate, job]);

  const value = useMemo<ExternalIntakeContextValue>(
    () => ({
      candidate,
      job,
      hasCandidateData:
        candidate.strengths.length > 0 || candidate.preferences.length > 0 || candidate.evidence.length > 0,
      hasJobData: job.title.trim().length > 0 && job.criticalTasks.length > 0,
      setCandidateList: (field, value) => {
        setCandidate((current) =>
          withCandidateScore({
            ...current,
            [field]: splitExternalList(value)
          })
        );
      },
      setJobField: (field, value) => {
        setJob((current) => ({
          ...current,
          [field]:
            field === "complexity" ? (value as ExternalJobComplexity) : value
        }));
      },
      setJobList: (field, value) => {
        setJob((current) => ({
          ...current,
          [field]: splitExternalList(value)
        }));
      },
      resetExternalIntake: () => {
        setCandidate(defaultCandidate);
        setJob(defaultJob);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [candidate, job]
  );

  return (
    <ExternalIntakeContext.Provider value={value}>{children}</ExternalIntakeContext.Provider>
  );
};

export const useExternalIntake = () => {
  const context = useContext(ExternalIntakeContext);

  if (!context) {
    throw new Error("useExternalIntake must be used within ExternalIntakeProvider");
  }

  return context;
};
