import type { Release } from "../../types/entities/Release";
import type { ReleaseItemType } from "../../types/entities/ReleaseItem";
import styles from "./ReleaseCard.module.css";

type ReleaseCardProps = {
  release: Release;
  onViewDetails: () => void;
};

const categoryLabels: Record<ReleaseItemType, string> = {
  Feature: "New Features",
  Improvement: "Improvements",
  Refactoring: "Refactoring",
  "Security Fix": "Security Fixes",
  "Bug Fix": "Bug Fixes",
};

const categoryStyles: Record<ReleaseItemType, string> = {
  Feature: styles.feature,
  Improvement: styles.improvement,
  Refactoring: styles.refactoring,
  "Security Fix": styles.security,
  "Bug Fix": styles.bugs,
};

const getCategoryCounts = (release: Release) => {
  const categoryCounts = new Map<ReleaseItemType, number>();

  release.release_items?.forEach((item) => {
    if (!item.item_type) return;

    categoryCounts.set(
      item.item_type,
      (categoryCounts.get(item.item_type) ?? 0) + 1,
    );
  });

  return Array.from(categoryCounts, ([type, number]) => ({ type, number }));
};

export const ReleaseCard = ({ release, onViewDetails }: ReleaseCardProps) => {
  const version =
    release.release_number ??
    release.release_version?.version_number?.toString() ??
    "";
  const categories = getCategoryCounts(release);

  return (
    <article className={styles.card}>
      <div className={styles.versionColumn}>
        <span className={styles.version}>{version}</span>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{release.title ?? "Release"}</h2>
        {release.description && (
          <p className={styles.description}>{release.description}</p>
        )}

        <div className={styles.categories}>
          {categories.map(({ type, number }) => (
            <span
              className={`${styles.category} ${categoryStyles[type]}`}
              key={type}
            >
              <span className={styles.categoryDot} aria-hidden="true" />
              {number} {categoryLabels[type]}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.viewDetailsButton}
        onClick={onViewDetails}
      >
        View Details
        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </button>
    </article>
  );
};
