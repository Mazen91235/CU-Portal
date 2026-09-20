import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { useLazyGetReleaseQuery } from "../../../services/apis/user/ReleaseAPIs";
import type { ReleaseResponseDto } from "../../../types/dtos/ReleaseDtos";
import { StatCard } from "../../../components/card/StatCard";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { getErrorMessage } from "../../../utils/ErrorHandling";
import { formatCalendarDate } from "../../../utils/Formatter";
import styles from "./ReleasePage.module.css";

const getReleaseCategories = (release: ReleaseResponseDto) => {
    const categoryCounts = new Map<string, number>();

    release.release_items?.forEach((item) => {
        if (!item.item_type) return;
        categoryCounts.set(
            item.item_type,
            (categoryCounts.get(item.item_type) ?? 0) + 1,
        );
    });

    return Array.from(categoryCounts, ([type, number]) => ({ type, number }));
};

const categoryLabels: Record<ReleaseItemType, string> = {
    Feature: "Features",
    Improvement: "Improvements",
    Refactoring: "Refactoring",
    "Security Fix": "Security Fixes",
    "Bug Fix": "Bug Fixes",
};

const releaseItemTypes: ReleaseItemType[] = [
    "Feature",
    "Improvement",
    "Refactoring",
    "Security Fix",
    "Bug Fix",
];

export function ReleasePage() {
    const { releaseId } = useParams<{ releaseId: string }>();
    const navigate = useNavigate();
    const [release, setRelease] = useState<ReleaseResponseDto | null>(null);
    const [getRelease] = useLazyGetReleaseQuery();

    const fetchRelease = useCallback(async () => {
        if (!releaseId) return;
        try {
            const result = await getRelease({
                release_id: Number(releaseId),
            }).unwrap();
            const release = result.data;
            if (!release) {
                navigate("/user/system/releases", {
                    state: { error: "Failed to fetch release" },
                });
                return;
            }
            setRelease(release);
        } catch (error) {
            navigate("/user/system/releases", {
                state: { error: getErrorMessage(error) || "Failed to fetch release" },
            });
        }
    }, [getRelease, navigate, releaseId]);

    useAuthQuery(fetchRelease);

    if (!release) return null;

    return (
        <Layout>
            <PageSeo
                title="Release - CU Portal"
                description="View release information for CU Portal"
            />
            <SubBanner
                title={release.title ?? "Release"}
                description={release.details?.description ?? undefined}
                icon="user"
                linkText="Back to all releases"
                linkTo="/user/system/releases"
            />
            <main className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Version"
                        value={
                            release.release_number ??
                            release.release_version?.version_number ??
                            "-"
                        }
                        icon="tag"
                    />
                    <StatCard
                        type="Release Date"
                        value={formatCalendarDate(release.date)}
                        icon="calendar"
                    />
                    <StatCard
                        type="Total Updates"
                        value={release.release_items?.length ?? 0}
                        icon="check"
                    />
                    <StatCard
                        type="Categories"
                        value={getReleaseCategories(release).length}
                        icon="book"
                    />
                </div>

                <section className={styles.descriptionSection}>
                    <h2 className={styles.sectionTitle}>Description</h2>
                    <p className={styles.description}>
                        {release.details?.description || (
                            <span>No description available</span>
                        )}
                    </p>
                </section>

                <div className={styles.categorySections}>
                    {releaseItemTypes.map((type) => {
                        const items = release.release_items?.filter(
                            (item) => item.item_type === type,
                        );

                        if (!items?.length) return null;

                        return (
                            <section
                                className={styles.categorySection}
                                key={type}
                            >
                                <h2 className={styles.sectionTitle}>
                                    {items.length === 1
                                        ? categoryLabels[type].replace(
                                              type.endsWith("Fix")
                                                  ? /es$/
                                                  : /s$/,
                                              "",
                                          )
                                        : categoryLabels[type]}
                                </h2>
                                <div className={styles.itemsList}>
                                    {items.map((item, index) => (
                                        <div
                                            className={styles.item}
                                            key={`${type}-${index}`}
                                        >
                                            <span
                                                className={styles.itemMarker}
                                            />
                                            <p className={styles.itemContent}>
                                                {item.content ??
                                                    "Release update included in this version."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
        </Layout>
    );
}
