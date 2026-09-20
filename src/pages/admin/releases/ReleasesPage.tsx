import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import type { ReleaseResponseDto } from "../../../types/dtos/ReleaseDtos";
import type { VersionResponseDto } from "../../../types/dtos/VersionDtos";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import { useCallback, useMemo, useRef, useState } from "react";
import { formatDate } from "../../../utils/Formatter";
import styles from "./ReleasesPage.module.css";
import { useNavigate } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import {
    useDeleteReleaseMutation,
    useLazyGetReleasesQuery,
    useLazyGetVersionsQuery,
} from "../../../services/apis/admin/ReleaseAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import { NoContentSection } from "../../../components/section/NoContentSection";

export function ReleasesPage() {
    const [releases, setReleases] = useState<ReleaseResponseDto[]>([]);
    const [latestRelease, setLatestRelease] =
        useState<ReleaseResponseDto | null>(null);
    const latestReleaseFetched = useRef(false);
    const [versions, setVersions] = useState<VersionResponseDto[]>([]);
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const queryFilter = getFilter("query", "");
    const setQueryFilter = getFilterSetter("query");
    const versionsFilter = getFilter("release_version_id", "");
    const setVersionsFilter = getFilterSetter("release_version_id");
    const dateFromFilter = getFilter(
        "date_from",
        new Date().toLocaleDateString("en-CA"),
    );
    const setDateFromFilter = getFilterSetter("date_from", true);
    const dateToFilter = getFilter("date_to", "");
    const setDateToFilter = getFilterSetter("date_to", true);
    const [releaseToDelete, setReleaseToDelete] =
        useState<ReleaseResponseDto | null>(null);
    const navigation = useNavigate();
    const [getReleases] = useLazyGetReleasesQuery();
    const [getVersions] = useLazyGetVersionsQuery();
    const [deleteRelease] = useDeleteReleaseMutation();

    const fetchVersions = useCallback(async () => {
        try {
            const result = await getVersions().unwrap();
            setVersions(result.data ?? []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getVersions]);

    const fetchReleases = useCallback(async () => {
        try {
            const result = await getReleases({
                data: {
                    query: queryFilter || undefined,
                    release_version_id: versionsFilter
                        ? Number(versionsFilter)
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
    }, [getReleases, queryFilter, versionsFilter]);

    const fetchLatestRelease = useCallback(async () => {
        if (latestReleaseFetched.current) return;

        try {
            const result = await getReleases({
                data: {},
                includes: ["release_version", "release_items"],
                order_by: ["date"],
                descending: true,
                limit: 1,
            }).unwrap();
            setLatestRelease(result.data?.[0] ?? null);
            latestReleaseFetched.current = true;
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getReleases]);

    useAuthQuery(fetchVersions);
    useAuthQuery(fetchReleases);
    useAuthQuery(fetchLatestRelease);

    const filteredReleases = useMemo(
        () =>
            releases.filter((release) => {
                const releaseDate = release.date ?? "";
                const matchesVersion =
                    !versionsFilter ||
                    release.release_version?.id?.toString() === versionsFilter;
                const matchesDateFrom =
                    !dateFromFilter || releaseDate >= dateFromFilter;
                const matchesDateTo =
                    !dateToFilter || releaseDate <= dateToFilter;

                return matchesVersion && matchesDateFrom && matchesDateTo;
            }),
        [dateFromFilter, dateToFilter, releases, versionsFilter],
    );

    const getReleaseCategoryCount = (release: ReleaseResponseDto) =>
        new Set(
            release.release_items
                ?.map((item) => item.item_type)
                .filter((itemType): itemType is ReleaseItemType =>
                    Boolean(itemType),
                ),
        ).size;

    const handleEditRelease = (release: ReleaseResponseDto) => {
        navigation(buildRedirectUrl(`/admin/releases/edit/${release.id}`));
    };

    const handleViewRelease = (releaseId: number) => {
        navigation(buildRedirectUrl(`/admin/releases/${releaseId}`));
    };

    const handleDeleteClick = (release: ReleaseResponseDto) => {
        setReleaseToDelete(release);
    };

    const handleDelete = async () => {
        if (!releaseToDelete?.id) return;
        try {
            await deleteRelease({ release_id: releaseToDelete.id }).unwrap();
            showToast("success", "Success", "Release deleted successfully");
            setReleases((currentReleases) =>
                currentReleases.filter(
                    (release) => release.id !== releaseToDelete.id,
                ),
            );
            setReleaseToDelete(null);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleAddNewRelease = () => {
        navigation("/admin/releases/create");
    };

    return (
        <Layout>
            <PageSeo
                title="Releases - CU Portal"
                description="Browse and access the latest releases of CU Portal"
            />
            <Banner
                title="Releases"
                description="Browse and access the latest releases of CU Portal"
                button="Add New Release "
                buttonAction={handleAddNewRelease}
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <input
                            type="search"
                            value={queryFilter}
                            onChange={(event) =>
                                setQueryFilter(event.target.value)
                            }
                            placeholder="Search releases"
                            aria-label="Search releases"
                        />
                    </div>
                    <div className={styles.filtersRow}>
                        <SelectFilter
                            placeholder="Versions"
                            options={[...versions]
                                .sort(
                                    (first, second) =>
                                        (second.version_number ?? 0) -
                                        (first.version_number ?? 0),
                                )
                                .map((version) => ({
                                    value: String(version.id),
                                    label: `V${version.version_number}`,
                                }))}
                            value={versionsFilter}
                            setValue={setVersionsFilter}
                        />
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                            defaultDate={dateFromFilter}
                            value={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                            value={dateToFilter}
                            startDay={false}
                        />
                    </div>
                </div>
                <div className={styles.releasesGrid}>
                    {filteredReleases.length > 0 ? (
                        filteredReleases.map((release) => (
                            <Card
                                key={release.id}
                                title={release.title ?? "Untitled Release"}
                                badge={
                                    release.release_number ?? "Unknown Version"
                                }
                                secondaryBadge={
                                    release.id === latestRelease?.id
                                        ? "Latest Release "
                                        : undefined
                                }
                                items={[
                                    {
                                        icon: "calendar",
                                        label: "Release Date",
                                        value: formatDate(release.date),
                                    },
                                    {
                                        icon: "checkmark-done",
                                        label: "Updates",
                                        value: String(
                                            release.release_items?.length ?? 0,
                                        ),
                                    },
                                    {
                                        icon: "book-saved",
                                        label: "Categories",
                                        value: String(
                                            getReleaseCategoryCount(release),
                                        ),
                                    },
                                ]}
                                button="View Release"
                                buttonAction={() =>
                                    handleViewRelease(release.id!)
                                }
                                editable
                                deletable
                                hasOptions
                                onEdit={() => handleEditRelease(release)}
                                onDelete={() => handleDeleteClick(release)}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <NoContentSection
                                icon="file-text"
                                label={
                                    releases.length
                                        ? "No releases match the selected filters"
                                        : "No releases found"
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={releaseToDelete !== null}
                onClose={() => setReleaseToDelete(null)}
                onConfirm={handleDelete}
                confirmText="Delete Release"
                title="Delete Release?"
                message={`Are you sure you want to delete ${releaseToDelete?.title ?? "this release"}? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
}
