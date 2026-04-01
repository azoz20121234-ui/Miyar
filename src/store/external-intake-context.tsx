"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { CandidateIntake, EmployerIntake } from "@/lib/external-handoff";

interface ExternalIntakeContextValue {
  candidate: CandidateIntake;
  employer: EmployerIntake;
  updateCandidate: <K extends keyof CandidateIntake>(
    section: K,
    value: Partial<CandidateIntake[K]>
  ) => void;
  updateEmployer: <K extends keyof EmployerIntake>(
    section: K,
    value: Partial<EmployerIntake[K]>
  ) => void;
  resetExternalIntake: () => void;
}

const STORAGE_KEY = "meyar-external-intake";

const defaultCandidate: CandidateIntake = {
  start: {
    fullName: "مرشح بصري",
    city: "الرياض",
    targetRole: "دعم إداري / إدخال بيانات"
  },
  capabilities: {
    digitalNavigation: "أستخدم لوحة المفاتيح وأتنقل داخل الأنظمة النصية بثبات.",
    writtenCommunication: "أتعامل مع البريد والردود الكتابية بشكل يومي.",
    documentHandling: "أراجع الملفات القابلة للقراءة النصية بشكل أفضل من الملفات المصوّرة.",
    keyboardUse: "سرعتي جيدة في الإدخال والتنقل بالاختصارات."
  },
  evidence: {
    workSample: "لدي خبرة في إدخال البيانات ومتابعة الجداول والبريد.",
    toolsUsed: "قارئ شاشة، تكبير شاشة، Outlook، Excel، أنظمة داخلية.",
    supportEvidence: "أدائي يستقر أكثر عندما تكون الواجهات قابلة للقراءة والتنقل بالاختصارات."
  },
  preferences: {
    workMode: "مكتبي أو هجين ضمن مهام كتابية وأنظمة واضحة.",
    supportTools: "قارئ شاشة، تكبير شاشة، ومسار عمل يعتمد على لوحة المفاتيح.",
    scheduleNotes: "أفضل مهام متقطعة وواضحة الأولوية مع مراجعات قصيرة.",
    contactPreference: "التواصل الكتابي أولًا، والاجتماعات عند الحاجة."
  }
};

const defaultEmployer: EmployerIntake = {
  start: {
    companyName: "شركة خدمات رقمية سعودية",
    ownerName: "مسؤول التوظيف",
    roleTitle: "دعم إداري / إدخال بيانات"
  },
  jobBreakdown: {
    rolePurpose: "تنفيذ أعمال الدعم الإداري وإدخال البيانات والمتابعة داخل الأنظمة.",
    coreTasks: "إدخال بيانات، متابعة البريد، تحديث الجداول، مراجعة ملفات، ردود كتابية.",
    tools: "البريد، الجداول، نظام داخلي، ملفات PDF، Teams."
  },
  requirements: {
    mustHave: "دقة إدخال، قراءة واجهات، كتابة واضحة، التزام بالمتابعة.",
    communicationPattern: "تواصل كتابي أساسي مع اجتماعات محدودة.",
    workMode: "مكتب مع أنظمة داخلية ومهام رقمية."
  },
  risks: {
    operationalRisks: "بطء مراجعة الملفات المصوّرة، صعوبة التنقل في الواجهات المعقدة.",
    reviewPoints: "واقعية المهام، حجم الملفات، قابلية الاختصارات، وضوح القوالب.",
    blockers: "الملفات غير القابلة للقراءة، تنقل مرهق داخل الشاشات، غياب تكييف واضح."
  },
  accommodations: {
    currentSupport: "لا يوجد مسار ثابت بعد للتكييف داخل الوظيفة الحالية.",
    openAdjustments: "قارئ شاشة، تكبير شاشة، workflow بلوحة المفاتيح، قوالب واضحة.",
    budgetNotes: "نحتاج تقديرًا سريعًا للتكلفة والزمن قبل بدء الحالة."
  }
};

const ExternalIntakeContext = createContext<ExternalIntakeContextValue | null>(null);

export const ExternalIntakeProvider = ({ children }: { children: ReactNode }) => {
  const [candidate, setCandidate] = useState<CandidateIntake>(defaultCandidate);
  const [employer, setEmployer] = useState<EmployerIntake>(defaultEmployer);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as {
        candidate?: CandidateIntake;
        employer?: EmployerIntake;
      };

      if (parsed.candidate) setCandidate(parsed.candidate);
      if (parsed.employer) setEmployer(parsed.employer);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ candidate, employer }));
  }, [candidate, employer]);

  const value = useMemo<ExternalIntakeContextValue>(
    () => ({
      candidate,
      employer,
      updateCandidate: (section, payload) => {
        setCandidate((current) => ({
          ...current,
          [section]: {
            ...current[section],
            ...payload
          }
        }));
      },
      updateEmployer: (section, payload) => {
        setEmployer((current) => ({
          ...current,
          [section]: {
            ...current[section],
            ...payload
          }
        }));
      },
      resetExternalIntake: () => {
        setCandidate(defaultCandidate);
        setEmployer(defaultEmployer);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [candidate, employer]
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
