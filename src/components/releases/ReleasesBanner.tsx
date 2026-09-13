import styles from "./ReleasesBanner.module.css";
import type { Release } from "../../types/entities/Release";
import type { ReleaseItemType } from "../../types/entities/ReleaseItem";

export type ReleaseCategory = {
  type: ReleaseItemType;
  number: number;
};

type ReleasesBannerProps = {
  release: Release;
  onClose: () => void;
  onViewAllReleases: () => void;
};

const categoryLabels: Record<ReleaseItemType, string> = {
  Feature: "New Features",
  Improvement: "Improvements",
  Refactoring: "Refactoring",
  "Security Fix": "Security Fixes",
  "Bug Fix": "Bug Fixes",
};

const getReleaseCategories = (release: Release): ReleaseCategory[] => {
  const categoryCounts = new Map<ReleaseItemType, number>();

  release.release_items?.forEach((item) => {
    if (!item.item_type) return;

    categoryCounts.set(
      item.item_type,
      (categoryCounts.get(item.item_type) ?? 0) + 1,
    );
  });

  return Array.from(categoryCounts, ([name, number]) => ({
    type: name,
    number,
  }));
};

const categoryStyles: Record<ReleaseItemType, string> = {
  Feature: styles.feature,
  Improvement: styles.improvement,
  Refactoring: styles.refactoring,
  "Security Fix": styles.security,
  "Bug Fix": styles.bugs,
};

const formatReleaseDate = (date?: string) => {
  if (!date) return "N/A";

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  const monthName = parsedDate.toLocaleString("en-US", { month: "short" });
  const displayMonth = monthName === "Sep" ? "Sept" : monthName;
  return `${displayMonth} ${parsedDate.getDate()}, ${parsedDate.getFullYear()}`;
};

export const ReleasesBanner = ({
  release,
  onClose,
  onViewAllReleases,
}: ReleasesBannerProps) => {
  const title = release.title ?? "Release";
  const version =
    release.release_version?.version_number?.toString() ??
    release.release_number ??
    "";
  const date = release.date ?? "";
  const categories = getReleaseCategories(release);

  return (
    <section className={styles.banner} aria-label="Latest release">
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close release banner"
      >
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>

      <div className={styles.content}>
        <div className={styles.headingRow}>
          <span className={styles.releaseLabel}>Latest Release</span>
          <span className={styles.version}>{version}</span>
        </div>

        <h2 className={styles.title}>{title}</h2>

        <time className={styles.date} dateTime={date}>
          <i className="fa-regular fa-calendar" aria-hidden="true"></i>
          {formatReleaseDate(date)}
        </time>

        <div className={styles.categories}>
          {categories.map((category) => (
            <span
              className={`${styles.category} ${categoryStyles[category.type]}`}
              key={category.type}
            >
              <span className={styles.categoryDot} aria-hidden="true" />
              {category.number} {categoryLabels[category.type]}
            </span>
          ))}
        </div>

        <button
          type="button"
          className={styles.viewAllButton}
          onClick={onViewAllReleases}
        >
          View All Releases
          <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    </section>
  );
};
