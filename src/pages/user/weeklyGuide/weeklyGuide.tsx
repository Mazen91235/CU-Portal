import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from "./weekltGuide.module.css";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { PageSeo } from "../../../components/PageSeo";
import { Preview } from "../../../components/preview/Preview";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";
import { downloadFile } from "../../../utils/FileDownloader";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import { formatTimeAgo } from "../../../utils/Formatter";
import { FaChevronUp } from "react-icons/fa";
import {
    formatWeekLabel,
    MonthPicker,
} from "../../../components/timeline/MonthPicker";
import { EmptySection } from "../../../components/calendar/EmptySection";
import { useLazyGetWeeksQuery } from "../../../services/apis/user/WeekAPIs";
import { useLazyGetMaterialsQuery } from "../../../services/apis/user/MaterialAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppSelector } from "../../../services/redux/Hooks";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";

/* ---------- Types ---------- */

function WeeklyMaterialCard({ item }: { item: MaterialResponseDto }) {
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const fileData = item.attachment?.details?.file_data;
    const fileType =
        fileData?.file_type || fileData?.type || item.material_type;
    const isFile = item.material_type === "file";
    const isLink =
        item.material_type === "drive" ||
        item.material_type === "youtube" ||
        item.material_type === "external";

    const handlePreview = () => {
        if (fileData?.id) {
            setPreviewFile({ id: fileData.id, name: item.name || "Preview" });
        }
    };

    const handleDownload = async () => {
        if (!fileData?.id) return;
        try {
            await downloadFile(fileData.id);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleOpenLink = () => {
        const url = item.attachment?.url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <>
            <article className={styles.fileCard}>
                <div className={styles.fileInfo}>
                    <img
                        src={getFileIcon(fileType || undefined)}
                        alt=""
                        className={styles.fileIcon}
                    />
                    <div className={styles.fileText}>
                        <span className={styles.fileName}>
                            {item.name || "Unnamed material"}
                        </span>
                        <span className={styles.fileMeta}>
                            {formatTimeAgo(
                                item.updated_at || item.created_at || "",
                            )}
                        </span>
                    </div>
                </div>

                {(isFile || isLink) && (
                    <>
                        <div className={styles.fileActions}>
                            {isFile && fileData?.id && (
                                <>
                                    <button
                                        type="button"
                                        className={styles.fileActionButton}
                                        onClick={handlePreview}
                                    >
                                        <i
                                            className="fas fa-eye"
                                            aria-hidden="true"
                                        />
                                        Preview
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.fileActionButton}
                                        onClick={() => void handleDownload()}
                                    >
                                        <i
                                            className="fas fa-download"
                                            aria-hidden="true"
                                        />
                                        Download
                                    </button>
                                </>
                            )}
                            {isLink && item.attachment?.url && (
                                <button
                                    type="button"
                                    className={styles.fileActionButton}
                                    onClick={handleOpenLink}
                                >
                                    <i
                                        className="fas fa-external-link"
                                        aria-hidden="true"
                                    />
                                    Open
                                </button>
                            )}
                        </div>

                        <div className={styles.fileActionsMobile}>
                            <MaterialActionsDropdown
                                onShare={() => {}}
                                onMove={() => {}}
                                onCopy={() => {}}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                onView={isFile ? handlePreview : handleOpenLink}
                                onDownload={
                                    isFile && fileData?.id
                                        ? () => void handleDownload()
                                        : undefined
                                }
                                showShare={false}
                                showMove={false}
                                showCopy={false}
                                showEdit={false}
                                showDelete={false}
                                showDownload={isFile && Boolean(fileData?.id)}
                            />
                        </div>
                    </>
                )}
            </article>
            {previewFile && (
                <Preview
                    file_id={previewFile.id}
                    fileName={previewFile.name}
                    onClose={() => setPreviewFile(null)}
                    onDownload={handleDownload}
                />
            )}
        </>
    );
}

/* ---------- Accordion section ---------- */

function AccordionSection({
    title,
    materials,
}: {
    title: string;
    materials: MaterialResponseDto[];
}) {
    const [open, setOpen] = useState(true);
    const count = materials.length;

    return (
        <div className={styles.section}>
            <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <span className={styles.sectionTitle}>
                    {title}
                    <span className={styles.sectionCount}>
                        ({count} {count === 1 ? "Item" : "Items"})
                    </span>
                </span>
                <span
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                >
                    <FaChevronUp aria-hidden="true" />
                </span>
            </button>

            {open && count > 0 && (
                <div className={styles.sectionBody}>
                    {materials.map((item) => (
                        <WeeklyMaterialCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function UserWeeklyGuide({
    weekNumber,
    materials,
    onWeekChange,
    isLoading,
    periodLabel,
    previousDisabled,
    nextDisabled,
}: {
    materials: MaterialResponseDto[];
    weekNumber: number;
    onWeekChange: (amount: number) => void;
    isLoading: boolean;
    periodLabel?: string;
    previousDisabled: boolean;
    nextDisabled: boolean;
}) {
    const sections = useMemo(() => {
        const grouped = new Map<string, MaterialResponseDto[]>();
        (materials || []).forEach((material) => {
            const subjectId = material.subject?.id ?? "other";
            const title = material.subject?.name || "Other Materials";
            const key = `${subjectId}:${title}`;
            const items = grouped.get(key) || [];
            items.push(material);
            grouped.set(key, items);
        });
        return Array.from(grouped.values()).map(
            (materials) =>
                [
                    materials[0]?.subject?.name || "Other Materials",
                    materials,
                ] as [string, MaterialResponseDto[]],
        );
    }, [materials]);

    return (
        <section className={styles.panel}>
            <div className={styles.weekPicker}>
                <MonthPicker
                    mode="week"
                    weekNumber={weekNumber}
                    periodLabel={periodLabel}
                    previousDisabled={previousDisabled}
                    nextDisabled={nextDisabled}
                    onPeriodChange={(_, amount) => onWeekChange(amount)}
                />
            </div>
            {sections.length > 0 ? (
                <div className={styles.sectionsList}>
                    {sections.map(([title, materials]) => (
                        <AccordionSection
                            key={title}
                            title={title}
                            materials={materials}
                        />
                    ))}
                </div>
            ) : (
                !isLoading && (
                    <div>
                        <EmptySection
                            icon="calendar"
                            title="No materials for this week"
                            description="There are no course materials available for the selected week."
                        />
                    </div>
                )
            )}
        </section>
    );
}

export function WeeklyGuidePage() {
    const { weekId: routeWeekId } = useParams();
    const navigate = useNavigate();
    const [week, setWeek] = useState<WeekResponseDto | null>(null);
    const [weekMaterials, setWeekMaterials] = useState<MaterialResponseDto[]>(
        [],
    );
    const user = useAppSelector((state) => state.user.user);
    const [getWeeks, { isFetching }] = useLazyGetWeeksQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();

    const academicWeekFilter = {
        faculty_id: user?.faculty?.id || undefined,
        department_id: user?.department?.id || undefined,
        year_id: user?.year?.id || undefined,
    };

    const fetchWeek = useCallback(async () => {
        const today = new Date().toLocaleDateString("en-CA");
        let selectedWeek = routeWeekId
            ? (
                  await getWeeks({
                      data: { ...academicWeekFilter, id: Number(routeWeekId) },
                      limit: 1,
                  }).unwrap()
              ).data?.[0]
            : (
                  await getWeeks({
                      data: {
                          ...academicWeekFilter,
                          start_date_includes: today,
                      },
                      order_by: ["start_date"],
                      limit: 1,
                  }).unwrap()
              ).data?.[0];

        if (!selectedWeek) {
            selectedWeek = (
                await getWeeks({
                    data: { ...academicWeekFilter, start_date_to: today },
                    order_by: ["start_date"],
                    descending: true,
                    limit: 1,
                }).unwrap()
            ).data?.[0];
        }
        if (!selectedWeek) {
            selectedWeek = (
                await getWeeks({
                    data: { ...academicWeekFilter, start_date_from: today },
                    order_by: ["start_date"],
                    limit: 1,
                }).unwrap()
            ).data?.[0];
        }

        setWeek(selectedWeek || null);

        if (!routeWeekId && selectedWeek?.id) {
            navigate(`/weeks/${selectedWeek.id}`, { replace: true });
        }

        if (!selectedWeek?.id) {
            setWeekMaterials([]);
            return;
        }

        const materialsResponse = await getMaterials({
            data: { week_id: selectedWeek.id },
            includes: ["subject", "attachment"],
            limit: 1000,
        }).unwrap();

        setWeekMaterials(materialsResponse.data || []);
    }, [
        getMaterials,
        getWeeks,
        navigate,
        routeWeekId,
        academicWeekFilter.faculty_id,
        academicWeekFilter.department_id,
        academicWeekFilter.year_id,
    ]);

    useAuthQuery(fetchWeek);

    const handleWeekChange = (amount: number) => {
        if (!week?.start_date) return;
        if (amount < 0) {
            void getWeeks({
                data: { ...academicWeekFilter, start_date_to: week.start_date },
                order_by: ["start_date"],
                descending: true,
                limit: 1,
            })
                .unwrap()
                .then((response) => {
                    if (response.data?.[0]?.id)
                        navigate(`/weeks/${response.data[0].id}`);
                });
            return;
        }
        const targetDate = new Date(`${week.start_date}T00:00:00Z`);
        targetDate.setUTCDate(targetDate.getUTCDate() + 7);
        void getWeeks({
            data: {
                ...academicWeekFilter,
                start_date_from: targetDate.toISOString().slice(0, 10),
            },
            order_by: ["start_date"],
            limit: 1,
        })
            .unwrap()
            .then((response) => {
                if (response.data?.[0]?.id)
                    navigate(`/weeks/${response.data[0].id}`);
            });
    };

    return (
        <Layout>
            <PageSeo
                title="Weekly Guide - CU Portal"
                description="Weekly Guide for students to access their course materials and resources."
            />
            <Banner
                title="My Weekly Guide"
                description="Weekly Guide for students to access their course materials and resources."
            />
            <div className={styles.container}>
                <UserWeeklyGuide
                    materials={weekMaterials}
                    weekNumber={week?.week_number || 0}
                    onWeekChange={handleWeekChange}
                    isLoading={isFetching}
                    periodLabel={
                        week?.week_number
                            ? formatWeekLabel(week.week_number, week.start_date)
                            : "No weeks available"
                    }
                    previousDisabled={!week?.start_date}
                    nextDisabled={!week?.start_date}
                />
            </div>
        </Layout>
    );
}
