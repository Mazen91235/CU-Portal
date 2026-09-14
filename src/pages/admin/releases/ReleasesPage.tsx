import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import type { Release } from "../../../types/entities/Release";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import { useCallback, useMemo, useState } from "react";
import { formatDateTime } from "../../../utils/Formatter";
import styles from "./ReleasesPage.module.css";
import { useNavigate } from "react-router";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import {
  useDeleteReleaseMutation,
  useLazyGetReleasesQuery,
} from "../../../services/apis/admin/ReleaseAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { mapReleaseResponse } from "../../../utils/ReleaseHelpers";
import { showToast } from "../../../utils/ToastsManager";
import { NoContentSection } from "../../../components/section/NoContentSection";

export function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [versionsFilter, setVersionsFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);
  const navigation = useNavigate();
  const [getReleases] = useLazyGetReleasesQuery();
  const [deleteRelease] = useDeleteReleaseMutation();

  const fetchReleases = useCallback(async () => {
    try {
      const result = await getReleases({
        data: {},
        order_by: ["date"],
        descending: true,
        limit: 1000,
      }).unwrap();
      setReleases((result.data ?? []).map(mapReleaseResponse));
    } catch (error) {
      handlePopupErrors(error);
    }
  }, [getReleases]);

  useAuthQuery(fetchReleases);

  const latestRelease = useMemo(
    () =>
      releases.reduce<Release | null>(
        (latest, release) =>
          !latest || (release.date ?? "") > (latest.date ?? "")
            ? release
            : latest,
        null,
      ),
    [releases],
  );

  const filteredReleases = useMemo(
    () =>
      releases.filter((release) => {
        const releaseDate = release.date ?? "";
        const matchesVersion =
          !versionsFilter || release.release_number === versionsFilter;
        const matchesDateFrom =
          !dateFromFilter || releaseDate >= dateFromFilter;
        const matchesDateTo = !dateToFilter || releaseDate <= dateToFilter;

        return matchesVersion && matchesDateFrom && matchesDateTo;
      }),
    [dateFromFilter, dateToFilter, releases, versionsFilter],
  );

  const getReleaseCategoryCount = (release: Release) =>
    new Set(
      release.release_items
        ?.map((item) => item.item_type)
        .filter((itemType): itemType is ReleaseItemType => Boolean(itemType)),
    ).size;

  const handleEditRelease = (release: Release) => {
    navigation(`/admin/releases/edit/${release.id}`);
  };

  const handleDeleteClick = (release: Release) => {
    setReleaseToDelete(release);
  };

  const handleDelete = async () => {
    if (!releaseToDelete?.id) return;
    try {
      await deleteRelease({ release_id: releaseToDelete.id }).unwrap();
      showToast("success", "Success", "Release deleted successfully");
      setReleases((currentReleases) =>
        currentReleases.filter((release) => release.id !== releaseToDelete.id),
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
          <div className={styles.filtersRow}>
            <SelectFilter
              placeholder="Versions"
              options={releases.map((release) => ({
                value: release.release_number ?? "",
                label: release.release_number ?? "Unknown version",
              }))}
              setValue={setVersionsFilter}
            />
            <DateFilter
              placeholder="Date From"
              setValue={setDateFromFilter}
              defaultDate={dateFromFilter}
            />
            <DateFilter placeholder="Date To" setValue={setDateToFilter} />
          </div>
        </div>
        <div className={styles.releasesGrid}>
          {filteredReleases.length > 0 ? (
            filteredReleases.map((release) => (
              <Card
                key={release.id}
                title={release.title}
                badge={release.release_number}
                secondaryBadge={
                  release.id === latestRelease?.id
                    ? "Latest Release "
                    : undefined
                }
                items={[
                  {
                    icon: "calendar",
                    label: "Release Date",
                    value: formatDateTime(release.date),
                  },
                  {
                    icon: "checkmark-done",
                    label: "Updates",
                    value: String(release.release_items?.length ?? 0),
                  },
                  {
                    icon: "book-saved",
                    label: "Categories",
                    value: String(getReleaseCategoryCount(release)),
                  },
                ]}
                button="View Release"
                buttonAction={() => navigation(`/admin/releases/${release.id}`)}
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
