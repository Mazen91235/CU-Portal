import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";

import { useLazyGetAnnouncementQuery } from "../../../services/apis/admin/AnnouncementAPIs";
import type { Announcement } from "../../../types/entities/Announcement";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./AnnouncementPage.module.css";

export const AnnouncementPage = () => {
    const { announcementId } = useParams<{ announcementId: string }>();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    const [getAnnouncement] = useLazyGetAnnouncementQuery();

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
                                    label: "Created By:",
                                    value: announcement.author?.name || "N/A",
                                },
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
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
