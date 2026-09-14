import styles from "./ReleaseCardHeader.module.css";
import type { ReleaseResponseDto } from "../../types/dtos/ReleaseDtos";
import type { ReleaseItemType } from "../../types/entities/ReleaseItem";
import { formatCalendarDate } from "../../utils/Formatter";

export type ReleaseCategory = {
    type: ReleaseItemType;
    number: number;
};

type ReleasesCardHeaderProps = {
    release: ReleaseResponseDto;
    onViewAllReleases: () => void;
};

const categoryLabels: Record<ReleaseItemType, string> = {
    Feature: "New Features",
    Improvement: "Improvements",
    Refactoring: "Refactoring",
    "Security Fix": "Security Fixes",
    "Bug Fix": "Bug Fixes",
};

const getReleaseCategories = (
    release: ReleaseResponseDto,
): ReleaseCategory[] => {
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

export const ReleaseCardHeader = ({
    release,
    onViewAllReleases,
}: ReleasesCardHeaderProps) => {
    const title = release.title ?? "Release";
    const version =
        release.release_number ??
        release.release_version?.version_number?.toString() ??
        "";
    const date = release.date ?? "";
    const categories = getReleaseCategories(release);

    return (
        <section className={styles.header} aria-label="Latest release">
            <div className={styles.content}>
                <div className={styles.headingRow}>
                    <span className={styles.releaseLabel}>Latest Release</span>
                    <span className={styles.version}>{version}</span>
                </div>

                <h2 className={styles.title}>{title}</h2>

                {release.details?.description && (
                    <div className={styles.description}>
                        {release.details.description}
                    </div>
                )}

                <time className={styles.date} dateTime={date}>
                    <i
                        className="fa-regular fa-calendar"
                        aria-hidden="true"
                    ></i>
                    {formatCalendarDate(date)}
                </time>

                <div className={styles.categories}>
                    {categories.map((category) => (
                        <span
                            className={`${styles.category} ${categoryStyles[category.type]}`}
                            key={category.type}
                        >
                            <span
                                className={styles.categoryDot}
                                aria-hidden="true"
                            />
                            {category.number}{" "}
                            {category.number === 1
                                ? categoryLabels[category.type].replace(
                                      category.type.endsWith("Fix")
                                          ? /es$/
                                          : /s$/,
                                      "",
                                  )
                                : categoryLabels[category.type]}
                        </span>
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.viewAllButton}
                    onClick={onViewAllReleases}
                >
                    View Release
                    <i
                        className="fa-solid fa-arrow-right"
                        aria-hidden="true"
                    ></i>
                </button>
            </div>
        </section>
    );
};
