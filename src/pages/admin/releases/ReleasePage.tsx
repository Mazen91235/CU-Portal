import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import type { Release } from "../../../types/entities/Release";
import { StatCard } from "../../../components/card/StatCard";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import styles from "./ReleasePage.module.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import ConfirmModal from "../../../components/modal/ConfirmModal";
const fakeReleases: Release = {
  id: 1,
  title: "CU Portal v1.0.0",
  date: "2024-06-01",
  description:
    "Initial release of CU Portal with core features and improvements.",
  release_number: "v1.0.0",
  version: 1,
  release_items: [
    ...Array.from({ length: 2 }, () => ({
      item_type: "Feature" as const,
      content: "Added new feature to enhance user experience.",
    })),
    ...Array.from({ length: 3 }, () => ({
      item_type: "Improvement" as const,
      content: "Improved performance and stability of the application.",
    })),
    { item_type: "Security Fix" as const },
  ],
};

const getReleaseCategories = (release: Release) => {
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
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    navigate("/admin/releases", {
      state: { success: "Release deleted successfully" },
    });
  };

  return (
    <Layout>
      <PageSeo
        title="Release - CU Portal"
        description="View release information for CU Portal"
      />
      <SubBanner
        title={fakeReleases.title ?? "Release"}
        description={fakeReleases.description ?? undefined}
        icon="user"
        linkText="Back to all releases"
        linkTo="/admin/releases"
        button="Edit Release"
        buttonAction={() => navigate(`/admin/releases/edit/${fakeReleases.id}`)}
        deleteButton="Delete Release"
        deleteAction={handleDeleteClick}
      />
      <main className={styles.container}>
        <div className={styles.statsRow}>
          <StatCard
            type="Version"
            value={fakeReleases.release_number ?? fakeReleases.version ?? "-"}
            icon="tag"
          />
          <StatCard
            type="Release Date"
            value={fakeReleases.date}
            icon="calendar"
          />
          <StatCard
            type="Total Updates"
            value={fakeReleases.release_items?.length ?? 0}
            icon="check"
          />
          <StatCard
            type="Categories"
            value={getReleaseCategories(fakeReleases).length}
            icon="book"
          />
        </div>

        <section className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{fakeReleases.description}</p>
        </section>

        <div className={styles.categorySections}>
          {releaseItemTypes.map((type) => {
            const items = fakeReleases.release_items?.filter(
              (item) => item.item_type === type,
            );

            if (!items?.length) return null;

            return (
              <section className={styles.categorySection} key={type}>
                <h2 className={styles.sectionTitle}>{categoryLabels[type]}</h2>
                <div className={styles.itemsList}>
                  {items.map((item, index) => (
                    <div className={styles.item} key={`${type}-${index}`}>
                      <span className={styles.itemMarker} />
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
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Delete Release"
        title="Delete Release?"
        message="Are you sure you want to delete this release? This action cannot be undone."
        colorType="red"
      />
    </Layout>
  );
}
