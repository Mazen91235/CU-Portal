import { useEffect, useState, useCallback } from "react";
import {
  readDismissal,
  writeDismissal,
  shouldShowBanner,
  getLocalDate,
  RELEASE_DISMISSAL_LIMIT,
} from "../utils/ReleaseDismissal";

export const useReleaseDismissal = (
  storageKey: string,
  releaseVersion: string,
  dismissLimit = RELEASE_DISMISSAL_LIMIT,
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissal = readDismissal(storageKey);

    if (shouldShowBanner(dismissal, releaseVersion, dismissLimit)) {
      if (!dismissal || dismissal.version !== releaseVersion) {
        writeDismissal(storageKey, {
          version: releaseVersion,
          dismissedDates: [],
        });
      }
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [storageKey, releaseVersion, dismissLimit]);

  const dismiss = useCallback(() => {
    const existing = readDismissal(storageKey);
    const base =
      existing?.version === releaseVersion
        ? existing
        : { version: releaseVersion, dismissedDates: [] as string[] };

    const dismissedDates = Array.from(
      new Set([...base.dismissedDates, getLocalDate()]),
    );
    writeDismissal(storageKey, { version: releaseVersion, dismissedDates });
    setIsVisible(false);
  }, [storageKey, releaseVersion]);

  return { isVisible, dismiss };
};
