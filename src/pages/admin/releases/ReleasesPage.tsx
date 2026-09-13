import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import type { Release } from "../../../types/entities/Release";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import { useMemo, useState } from "react";
import { formatDateTime } from "../../../utils/Formatter";
import styles from "./ReleasesPage.module.css";
import { useNavigate } from "react-router";
import ConfirmModal from "../../../components/modal/ConfirmModal";
const fakeReleases: Release[] = [
  {
    id: 1,
    title: "CU Portal v1.0.0",
    date: "2024-06-01",
    description:
      "Initial release of CU Portal with core features and improvements.",
    release_number: "v1.0.0",
    release_items: [
      ...Array.from({ length: 5 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 3 }, () => ({ item_type: "Bug Fix" as const })),
      ...Array.from({ length: 3 }, () => ({
        item_type: "Security Fix" as const,
      })),
      ...Array.from({ length: 3 }, () => ({
        item_type: "Refactoring" as const,
      })),
      ...Array.from({ length: 3 }, () => ({
        item_type: "Improvement" as const,
      })),
    ],
  },
  {
    id: 2,
    title: "Infrastructure Resilience Update",
    date: "2024-09-12",
    description:
      "Major improvements to database clustering and auto-scaling for busy periods.",
    release_number: "v1.1.0",
    release_items: [
      ...Array.from({ length: 2 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 3 }, () => ({
        item_type: "Improvement" as const,
      })),
      { item_type: "Security Fix" as const },
    ],
  },
  {
    id: 3,
    title: "Faster Materials and Search",
    date: "2025-02-18",
    description:
      "Improved material loading, search results, and navigation across courses.",
    release_number: "v1.2.0",
    release_items: [
      ...Array.from({ length: 4 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      ...Array.from({ length: 2 }, () => ({
        item_type: "Refactoring" as const,
      })),
    ],
  },
  {
    id: 4,
    title: "Account Security Improvements",
    date: "2025-08-05",
    description:
      "Strengthened account protection and simplified the sign-in experience.",
    release_number: "v1.3.0",
    release_items: [
      ...Array.from({ length: 3 }, () => ({
        item_type: "Security Fix" as const,
      })),
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      { item_type: "Improvement" as const },
    ],
  },
];

const versionsOptions = fakeReleases.map((release) => ({
  value: release.release_number ?? "",
  label: release.release_number ?? "Unknown version",
}));

export function ReleasesPage() {
  const [releases, setReleases] = useState(fakeReleases);
  const [versionsFilter, setVersionsFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);
  const navigation = useNavigate();

  const latestRelease = useMemo(
    () =>
      releases.reduce((latest, release) =>
        (release.date ?? "") > (latest.date ?? "") ? release : latest,
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

  const handleViewRelease = () => {
    // Implement the logic to view the release details
    navigation("/admin/releases/1"); // Replace with the actual release ID
  };

  const handleEditRelease = (release: Release) => {
    navigation(`/admin/releases/edit/${release.id}`);
  };

  const handleDeleteClick = (release: Release) => {
    setReleaseToDelete(release);
  };

  const handleDelete = () => {
    if (!releaseToDelete?.id) return;

    setReleases((currentReleases) =>
      currentReleases.filter((release) => release.id !== releaseToDelete.id),
    );
    setReleaseToDelete(null);
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
              options={versionsOptions}
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
          {filteredReleases.map((release) => (
            <Card
              key={release.id}
              title={release.title}
              badge={release.release_number}
              secondaryBadge={
                release.id === latestRelease.id ? "Latest Release " : undefined
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
              buttonAction={() => handleViewRelease()}
              editable
              deletable
              hasOptions
              onEdit={() => handleEditRelease(release)}
              onDelete={() => handleDeleteClick(release)}
            />
          ))}
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
