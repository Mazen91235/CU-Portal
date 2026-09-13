import type { ReleaseDismissal } from "../types/entities/ReleaseDismissal";

export const RELEASE_DISMISSAL_STORAGE_KEY =
  "cu-portal-latest-release-dismissal";
export const RELEASE_DISMISSAL_LIMIT = 3;

export const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidDismissal = (value: unknown): value is ReleaseDismissal => {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as ReleaseDismissal).version === "string" &&
    Array.isArray((value as ReleaseDismissal).dismissedDates)
  );
};

export const readDismissal = (storageKey: string): ReleaseDismissal | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return isValidDismissal(parsed) ? parsed : null;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const writeDismissal = (
  storageKey: string,
  dismissal: ReleaseDismissal,
) => {
  localStorage.setItem(storageKey, JSON.stringify(dismissal));
};

export const shouldShowBanner = (
  dismissal: ReleaseDismissal | null,
  releaseVersion: string,
  dismissLimit = RELEASE_DISMISSAL_LIMIT,
): boolean => {
  if (!dismissal || dismissal.version !== releaseVersion) return true;
  const dismissedDates = new Set(dismissal.dismissedDates);
  return (
    dismissedDates.size < dismissLimit && !dismissedDates.has(getLocalDate())
  );
};
