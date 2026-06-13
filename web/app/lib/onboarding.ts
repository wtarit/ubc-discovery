const LEGACY_STORAGE_KEY = "ubc-discovery-onboarding";
const STORAGE_KEY_PREFIX = "ubc-discovery-onboarding:";

export type OnboardingDraft = {
  preferred_name?: string;
  major?: string;
  year_standing?: number;
  faculty?: string;
  interests?: string[];
};

function storageKey(uid: string) {
  return `${STORAGE_KEY_PREFIX}${uid}`;
}

export function readOnboardingDraft(uid: string | null): OnboardingDraft {
  if (typeof window === "undefined" || !uid) return {};
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return JSON.parse(window.localStorage.getItem(storageKey(uid)) ?? "{}");
  } catch {
    return {};
  }
}

export function writeOnboardingDraft(uid: string | null, next: OnboardingDraft) {
  if (typeof window === "undefined" || !uid) return;
  window.localStorage.setItem(storageKey(uid), JSON.stringify(next));
}

export function mergeOnboardingDraft(uid: string | null, next: OnboardingDraft) {
  const merged = { ...readOnboardingDraft(uid), ...next };
  writeOnboardingDraft(uid, merged);
  return merged;
}

export function clearOnboardingDraft(uid: string | null) {
  if (typeof window === "undefined" || !uid) return;
  window.localStorage.removeItem(storageKey(uid));
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
