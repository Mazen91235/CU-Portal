import { Banner } from "../../../components/banner/Banner";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { ReleaseCard } from "../../../components/releases/ReleaseCard";
import { ReleaseCardHeader } from "../../../components/releases/ReleaseCardHeader";
import { VersionPicker } from "../../../components/releases/VersionPicker";
import {
    useLazyGetReleasesQuery,
    useLazyGetVersionsQuery,
} from "../../../services/apis/user/ReleaseAPIs";
import type { ReleaseResponseDto } from "../../../types/dtos/ReleaseDtos";
import type { VersionResponseDto } from "../../../types/dtos/VersionDtos";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useGetLatestRelease from "../../../hooks/useGetLatestRelease";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { getCalendarDateKey } from "../../../utils/CalendarHandler";
import styles from "./ReleasesPage.module.css";

const parseVersionParts = (release: ReleaseResponseDto): number[] =>
    (release.release_number ?? "")
        .replace(/^v/i, "")
        .split(".")
        .map((part) => Number(part) || 0);

const compareVersionsDescending = (
    a: ReleaseResponseDto,
    b: ReleaseResponseDto,
): number => {
    const versionA = parseVersionParts(a);
    const versionB = parseVersionParts(b);
    const length = Math.max(versionA.length, versionB.length);

    for (let i = 0; i < length; i++) {
        const diff = (versionB[i] ?? 0) - (versionA[i] ?? 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

const getTimelineDateLabel = (date?: string) => {
    if (!date) return "-";
    const calendarDate = getCalendarDateKey(date) ?? date.split("T")[0];
    const [year, month, day] = calendarDate.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return `${parsedDate.getDate()} ${parsedDate.toLocaleString("en-US", { month: "short", year: "numeric" })}`;
};

type ReleaseDateGroup = {
    date: string;
    releases: ReleaseResponseDto[];
};

export function ReleasesPage() {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const versionFilter = getFilter("version", "");
    const setVersionFilter = getFilterSetter("version");
    const [releases, setReleases] = useState<ReleaseResponseDto[]>([]);
    const [versions, setVersions] = useState<VersionResponseDto[]>([]);
    const latestRelease = useGetLatestRelease();
    const [getReleases] = useLazyGetReleasesQuery();
    const [getVersions] = useLazyGetVersionsQuery();

    const fetchVersions = useCallback(async () => {
        try {
            const result = await getVersions().unwrap();
            setVersions(
                [...(result.data ?? [])].sort(
                    (first, second) =>
                        (second.version_number ?? 0) -
                        (first.version_number ?? 0),
                ),
            );
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getVersions]);

    const fetchReleases = useCallback(async () => {
        try {
            const result = await getReleases({
                data: {
                    release_version_id: versionFilter
                        ? Number(versionFilter)
                        : undefined,
                },
                includes: ["release_version", "release_items"],
                order_by: ["date_nearest"],
                limit: 1000,
            }).unwrap();
            setReleases(result.data ?? []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getReleases, versionFilter]);

    useAuthQuery(fetchVersions);
    useAuthQuery(fetchReleases);

    const releasesWithoutLatest = useMemo(
        () => releases.filter((release) => release.id !== latestRelease?.id),
        [latestRelease?.id, releases],
    );

    const releaseGroups = useMemo(() => {
        const groups = new Map<string, Map<string, ReleaseResponseDto[]>>();

        releasesWithoutLatest
            .filter(
                (release) =>
                    !versionFilter ||
                    release.release_version?.id?.toString() === versionFilter,
            )
            .sort((first, second) => {
                const dateDiff = (second.date ?? "").localeCompare(
                    first.date ?? "",
                );
                if (dateDiff !== 0) return dateDiff;
                return compareVersionsDescending(first, second);
            })
            .forEach((release) => {
                const version = release.release_version?.id?.toString() ?? "0";
                const date = release.date ?? "";
                const dateGroups =
                    groups.get(version) ??
                    new Map<string, ReleaseResponseDto[]>();
                dateGroups.set(date, [
                    ...(dateGroups.get(date) ?? []),
                    release,
                ]);
                groups.set(version, dateGroups);
            });

        return Array.from(groups.entries())
            .sort(([first], [second]) => Number(second) - Number(first))
            .map(
                ([version, dateGroups]) =>
                    [
                        version,
                        Array.from(dateGroups.entries())
                            .sort(([first], [second]) =>
                                second.localeCompare(first),
                            )
                            .map(([date, releases]) => ({ date, releases })),
                    ] as [string, ReleaseDateGroup[]],
            );
    }, [releasesWithoutLatest, versionFilter]);

    return (
        <Layout>
            <PageSeo
                title="Releases - CU Portal"
                description="Browse and access the latest releases of CU Portal"
            />
            <Banner
                title="Releases"
                description="Browse and access the latest releases of CU Portal"
            />
            {latestRelease && (
                <ReleaseCardHeader
                    release={latestRelease}
                    onViewAllReleases={() =>
                        navigate(`/user/system/releases/${latestRelease.id}`)
                    }
                />
            )}

            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <VersionPicker
                        versions={versions.map((version) => ({
                            value: String(version.id),
                            label: `V${version.version_number}`,
                        }))}
                        value={versionFilter}
                        onVersionChange={setVersionFilter}
                    />
                </div>
                <div className={styles.timeline}>
                    {releaseGroups.length > 0 ? (
                        releaseGroups.map(([version, dateGroups]) => (
                            <section
                                className={styles.versionGroup}
                                key={version}
                            >
                                <div className={styles.versionHeading}>
                                    <div />
                                    <div className={styles.timelineMarker}>
                                        <span className={styles.timelineDot} />
                                    </div>
                                </div>
                                {dateGroups.map(({ date, releases }) => (
                                    <article
                                        className={styles.timelineRelease}
                                        key={`${version}-${date}`}
                                    >
                                        <div className={styles.timelineDate}>
                                            {getTimelineDateLabel(date)}
                                        </div>
                                        <div className={styles.timelineMarker}>
                                            <span
                                                className={styles.timelineDot}
                                            />
                                        </div>
                                        <div className={styles.timelineCard}>
                                            {releases.map((release) => (
                                                <div
                                                    className={styles.timelineReleaseItem}
                                                    key={release.id}
                                                >
                                                    <div
                                                        className={styles.timelineReleaseItemMarker}
                                                        aria-hidden="true"
                                                    >
                                                        <span className={styles.timelineReleaseItemDot} />
                                                    </div>
                                                    <ReleaseCard
                                                        release={release}
                                                        onViewDetails={() =>
                                                            navigate(
                                                                buildRedirectUrl(`/user/system/releases/${release.id}`),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </section>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <NoContentSection
                                icon="file-text"
                                label={
                                    releases.length
                                        ? "No releases match the selected version"
                                        : "No releases found"
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
