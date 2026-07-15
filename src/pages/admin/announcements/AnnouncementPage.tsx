import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";

import {
    useLazyGetAnnouncementQuery,
    useDeleteAnnouncementMutation,
} from "../../../services/apis/admin/AnnouncementAPIs";
import type { Announcement } from "../../../types/entities/Announcement";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./AnnouncementPage.module.css";

export const AnnouncementPage = () => {
    const { announcementId } = useParams<{ announcementId: string }>();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState<Announcement | null>(
        null,
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [getAnnouncement] = useLazyGetAnnouncementQuery();
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

    const fetchAnnouncement = useCallback(async () => {
        if (!announcementId) return;

        try {
            const result = await getAnnouncement({
                announcement_id: parseInt(announcementId),
            }).unwrap();
            setAnnouncement(result.data || null);
        } catch (error) {
            const err = error as DefaultAPIResponse;
            navigate("/admin/announcements", {
                state: {
                    error: err.data.message || "Failed to fetch announcement",
                },
            });
        }
    }, [getAnnouncement, navigate, announcementId]);

    const authQueryParams = useCallback(
        () => fetchAnnouncement(),
        [fetchAnnouncement],
    );

    useAuthQuery(authQueryParams);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!announcement?.id) return;

        try {
            await deleteAnnouncement({
                announcement_id: announcement.id,
            }).unwrap();
            showToast(
                "success",
                "Success",
                "Announcement deleted successfully",
            );
            navigate("/admin/announcements");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    if (!announcement) {
        return null;
    }

    return (
        <Layout>
            <PageSeo
                title={`${announcement.title} - Announcement Details - CU Portal`}
                description={`View announcement information for ${announcement.title}`}
            />

            <SubBanner
                title={announcement.title || "Announcement Details"}
                icon={GetIcon("announcements")}
                button="Edit Announcement"
                buttonAction={() =>
                    navigate(`/admin/announcements/edit/${announcement.id}`)
                }
                deleteButton="Delete Announcement"
                deleteAction={handleDeleteClick}
                linkText="Back to Announcements"
                linkTo="/admin/announcements"
            />

            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Subject"
                        value={announcement.subject?.name || "N/A"}
                        icon="book"
                    />
                    <StatCard
                        type="Date"
                        value={formatDateTime(announcement.date) || "N/A"}
                        icon="calendar"
                    />
                    <StatCard
                        type="Created At"
                        value={formatDateTime(announcement.created_at) || "N/A"}
                        icon="calendar"
                    />
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainContent}>
                        <LongSection title="Content" icon="align-left">
                            <div className={styles.detailsSection}>
                                {announcement.content || (
                                    <span>No content available</span>
                                )}

                                {((announcement.details?.files_data &&
                                    announcement.details.files_data.length >
                                        0) ||
                                    (announcement.links &&
                                        announcement.links.length > 0)) && (
                                    <AttachmentsAndLinksSection
                                        files={announcement.details?.files_data}
                                        links={announcement.links || []}
                                    />
                                )}
                            </div>
                        </LongSection>
                    </div>

                    <div className={styles.sidebar}>
                        <QuickInfoSection
                            items={[
                                {
                                    label: "Faculty:",
                                    value: announcement.faculty?.name || "N/A",
                                },
                                {
                                    label: "Department:",
                                    value:
                                        announcement.department?.name || "N/A",
                                },
                                {
                                    label: "Year:",
                                    value:
                                        announcement.year?.year?.toString() ||
                                        "N/A",
                                },
                                {
                                    label: "Type:",
                                    value: "Announcement",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
                title="Delete Announcement"
                message={`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
