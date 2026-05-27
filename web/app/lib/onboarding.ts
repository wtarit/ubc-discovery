const STORAGE_KEY = "ubc-discovery-onboarding";

export type OnboardingDraft = {
  preferred_name?: string;
  major?: string;
  year_standing?: number;
  faculty?: string;
  interests?: string[];
};

export function readOnboardingDraft(): OnboardingDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function writeOnboardingDraft(next: OnboardingDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function mergeOnboardingDraft(next: OnboardingDraft) {
  const merged = { ...readOnboardingDraft(), ...next };
  writeOnboardingDraft(merged);
  return merged;
}

export function clearOnboardingDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function yearLabelToStanding(label?: string) {
  if (!label) return undefined;
  const match = label.match(/^(\d+)/);
  return match ? Number(match[1]) : undefined;
}

export function yearStandingToLabel(year?: number | null) {
  if (!year) return "";
  if (year >= 5) return "5th year+";
  return `${year}${year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year`;
}
