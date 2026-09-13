import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import type { Release } from "../../../types/entities/Release";
import { StatCard } from "../../../components/card/StatCard";
import type { ReleaseItemType } from "../../../types/entities/ReleaseItem";
import styles from "./ReleasePage.module.css";
import { useNavigate } from "react-router";
import { useCallback, useState } from "react";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { useParams } from "react-router";
import {
  useLazyGetReleaseQuery,
  useDeleteReleaseMutation,
} from "../../../services/apis/admin/ReleaseAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { mapReleaseResponse } from "../../../utils/ReleaseHelpers";

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
  const { releaseId } = useParams<{ releaseId: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [getRelease] = useLazyGetReleaseQuery();
  const [deleteRelease] = useDeleteReleaseMutation();

  const fetchRelease = useCallback(async () => {
    if (!releaseId) return;
    try {
      const result = await getRelease({
        release_id: Number(releaseId),
      }).unwrap();
      setRelease(result.data ? mapReleaseResponse(result.data) : null);
    } catch (error) {
      handlePopupErrors(error);
      navigate("/admin/releases");
    }
  }, [getRelease, navigate, releaseId]);

  useAuthQuery(fetchRelease);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!release?.id) return;
    try {
      await deleteRelease({ release_id: release.id }).unwrap();
      navigate("/admin/releases", {
        state: { success: "Release deleted successfully" },
      });
    } catch (error) {
      handlePopupErrors(error);
    }
  };

  if (!release) return null;

  return (
    <Layout>
      <PageSeo
        title="Release - CU Portal"
        description="View release information for CU Portal"
      />
      <SubBanner
        title={release.title ?? "Release"}
        description={release.description ?? undefined}
        icon="user"
        linkText="Back to all releases"
        linkTo="/admin/releases"
        button="Edit Release"
        buttonAction={() => navigate(`/admin/releases/edit/${release.id}`)}
        deleteButton="Delete Release"
        deleteAction={handleDeleteClick}
      />
      <main className={styles.container}>
        <div className={styles.statsRow}>
          <StatCard
            type="Version"
            value={release.release_number ?? release.version ?? "-"}
            icon="tag"
          />
          <StatCard type="Release Date" value={release.date} icon="calendar" />
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
          <p className={styles.description}>{release.description}</p>
        </section>

        <div className={styles.categorySections}>
          {releaseItemTypes.map((type) => {
            const items = release.release_items?.filter(
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
