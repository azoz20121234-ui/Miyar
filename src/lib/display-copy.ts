export const stripInternalCodePrefix = (value?: string | null) =>
  value?.replace(/^[A-Z]{2,}-\d+\s*(?:[•\-–—]\s*)?/u, "").trim() ?? "";
