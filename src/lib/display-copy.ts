export const stripInternalCodePrefix = (value?: string | null) =>
  value?.replace(/^[A-Z]{2,}-\d+\s*(?:[•\-–—]\s*)?/u, "").trim() ?? "";

export const humanTaskFrequency = (value?: string | null) => {
  if (value === "continuous") return "مستمرة";
  if (value === "daily") return "يومية";
  if (value === "weekly") return "أسبوعية";
  if (value === "event-based") return "حسب الحدث";
  return value ?? "";
};

export const humanRedistributionPotential = (value?: string | null) => {
  if (value === "none") return "لا يوجد";
  if (value === "partial") return "جزئي";
  if (value === "high") return "مرتفع";
  return value ?? "";
};
