import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { MonthPicker } from "../../../components/timeline/MonthPicker";
import { EmptySection } from "../../../components/calendar/EmptySection";
import { Preview } from "../../../components/preview/Preview";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";
import { downloadFile } from "../../../utils/FileDownloader";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import { formatDate, formatTimeAgo } from "../../../utils/Formatter";
import { FaChevronUp } from "react-icons/fa";
import { WeekItemsEditor } from "../../../components/materials/WeekItemsEditor";
import { getWeekEndDate } from "../../../utils/WeekHelpers";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { useAppSelector } from "../../../services/redux/Hooks";
import {
    useDeleteWeekMutation,
    useLazyGetWeeksQuery,
} from "../../../services/apis/admin/WeekAPIs";
import {
    useLazyGetMaterialQuery,
    useUpdateMaterialMutation,
} from "../../../services/apis/admin/MaterialAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type {
    WeekItemMutationDto,
    WeekItemResponseDto,
} from "../../../types/dtos/WeekItemDtos";
import {
    getErrorMessage,
    handlePopupErrors,
} from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import useAuthQuery from "../../../hooks/useAuthQuery";
import styles from "./WeekPage.module.css";

function MaterialAdminCard({
    weekItem,
    onRefresh,
    availableWeeks,
}: {
    weekItem: WeekItemResponseDto;
    onRefresh: () => Promise<void>;
    availableWeeks: WeekResponseDto[];
}) {
    const material = weekItem.material;
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [weekItems, setWeekItems] = useState<WeekItemMutationDto[]>([]);
    const [getMaterial, { isFetching: isLoadingMaterial }] =
        useLazyGetMaterialQuery();
    const [updateMaterial, { isLoading: isUpdating }] =
        useUpdateMaterialMutation();

    const fileData = material?.attachment?.details?.file_data;
    const fileType =
        fileData?.file_type || fileData?.type || material?.material_type;
    const isFile = material?.material_type === "file";
    const isLink =
        material?.material_type === "drive" ||
        material?.material_type === "youtube" ||
        material?.material_type === "external";

    const handlePreview = () => {
        if (fileData?.id) {
            setPreviewFile({
                id: fileData.id,
                name: material?.name || "Preview",
            });
        }
    };

    const handleDownload = async () => {
        if (!fileData?.id) return;
        try {
            downloadFile(fileData.id);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleOpenLink = () => {
        const url = material?.attachment?.url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleOpenEdit = async () => {
        if (!material?.id) return;

        try {
            const response = await getMaterial({
                material_id: material.id,
            }).unwrap();
            const fullMaterial = response.data;
            const sourceItems =
                fullMaterial?.week_items ?? material.week_items ?? [];
            setWeekItems(
                sourceItems
                    .filter((item) => item.week?.id != null)
                    .map((item) => ({
                        week_id: item.week!.id!,
                        note: item.note?.trim() || undefined,
                    })),
            );
            setEditOpen(true);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const save = async () => {
        if (!material?.id) return;
        try {
            await updateMaterial({
                material_id: material.id,
                name: material.name || "",
                should_overwrite: false,
                material_type: material.material_type || "file",
                week_items: weekItems,
                details: {
                    url: material.attachment?.url || "",
                },
            }).unwrap();
            setEditOpen(false);
            await onRefresh();
            showToast(
                "success",
                "Saved",
                "Material weeks updated successfully",
            );
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    if (!material) return null;

    return (
        <>
            <article className={styles.fileCard}>
                <div className={styles.fileMain}>
                    <div className={styles.fileInfo}>
                        <img
                            src={getFileIcon(fileType || undefined)}
                            alt=""
                            className={styles.fileIcon}
                        />
                        <div className={styles.fileText}>
                            <span className={styles.fileName}>
                                {material.name || "Unnamed material"}
                            </span>
                            <span className={styles.fileMeta}>
                                {formatTimeAgo(
                                    material.updated_at ||
                                        material.created_at ||
                                        "",
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
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.fileActionButton}
                                            onClick={() =>
                                                void handleDownload()
                                            }
                                        >
                                            <i
                                                className="fas fa-download"
                                                aria-hidden="true"
                                            />
                                            Download
                                        </button>
                                    </>
                                )}
                                {isLink && material.attachment?.url && (
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
                                <button
                                    type="button"
                                    className={styles.fileActionButton}
                                    onClick={() => void handleOpenEdit()}
                                    disabled={isLoadingMaterial}
                                >
                                    <i
                                        className="fas fa-edit"
                                        aria-hidden="true"
                                    />
                                    {isLoadingMaterial ? "Loading..." : "Edit"}
                                </button>
                            </div>

                            <div className={styles.fileActionsMobile}>
                                <MaterialActionsDropdown
                                    onShare={() => {}}
                                    onMove={() => {}}
                                    onCopy={() => {}}
                                    onEdit={() => void handleOpenEdit()}
                                    onDelete={() => {}}
                                    onView={
                                        isFile ? handlePreview : handleOpenLink
                                    }
                                    onDownload={
                                        isFile && fileData?.id
                                            ? () => void handleDownload()
                                            : undefined
                                    }
                                    showShare={false}
                                    showMove={false}
                                    showCopy={false}
                                    showEdit
                                    showDownload={
                                        isFile && Boolean(fileData?.id)
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>

                {weekItem.note?.trim() && (
                    <div className={styles.itemNote}>{weekItem.note}</div>
                )}
            </article>

            {previewFile && (
                <Preview
                    file_id={previewFile.id}
                    fileName={previewFile.name}
                    onClose={() => setPreviewFile(null)}
                    onDownload={() => void handleDownload()}
                />
            )}

            {editOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        if (!isUpdating) setEditOpen(false);
                    }}
                >
                    <div
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2>Edit Material Weeks</h2>
                        <fieldset
                            disabled={isUpdating || isLoadingMaterial}
                            className={styles.fieldset}
                        >
                            <WeekItemsEditor
                                value={weekItems}
                                onChange={setWeekItems}
                                availableWeeks={availableWeeks}
                                disabled={isUpdating || isLoadingMaterial}
                            />
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setEditOpen(false)}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void save()}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Saving..." : "Update"}
                                </button>
                            </div>
                        </fieldset>
                    </div>
                </div>
            )}
        </>
    );
}

function AccordionSection({
    title,
    weekItems,
    availableWeeks,
    onRefresh,
}: {
    title: string;
    weekItems: WeekItemResponseDto[];
    availableWeeks: WeekResponseDto[];
    onRefresh: () => Promise<void>;
}) {
    const [open, setOpen] = useState(true);
    const count = weekItems.length;

    return (
        <div className={styles.section}>
            <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setOpen((value) => !value)}
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
                    {weekItems.map((weekItem) => (
                        <MaterialAdminCard
                            key={weekItem.id ?? weekItem.material?.id}
                            weekItem={weekItem}
                            onRefresh={onRefresh}
                            availableWeeks={availableWeeks}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function WeekPage() {
    const { weekId: routeWeekId } = useParams();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const parsedWeekId = Number(routeWeekId);
    const weekId =
        Number.isInteger(parsedWeekId) && parsedWeekId > 0
            ? parsedWeekId
            : null;
    const [week, setWeek] = useState<WeekResponseDto | null>(null);
    const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
    const [weekItems, setWeekItems] = useState<WeekItemResponseDto[]>([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [getWeeks] = useLazyGetWeeksQuery();
    const [deleteWeek] = useDeleteWeekMutation();

    const fetchWeek = useCallback(async () => {
        try {
            if (!weekId) {
                const weeksResponse = await getWeeks({
                    data: {
                        faculty_id: user?.faculty?.id || undefined,
                        department_id: user?.department?.id || undefined,
                        year_id: user?.year?.id || undefined,
                    },
                    order_by: ["start_date"],
                    descending: true,
                    limit: 1e6,
                }).unwrap();
                setWeeks(weeksResponse.data || []);
                setWeek(null);
                setWeekItems([]);
                if (weeksResponse.data?.[0]?.id) {
                    navigate(`/admin/weeks/${weeksResponse.data[0].id}`, {
                        replace: true,
                    });
                }
                return;
            }

            const selectedResponse = await getWeeks({
                data: { id: weekId },
                includes: [
                    "faculty",
                    "department",
                    "year",
                    "week_items.material.subject",
                    "week_items.material.attachment",
                ],
                limit: 1,
            }).unwrap();

            const selectedWeek = selectedResponse.data?.[0] || null;
            setWeek(selectedWeek);

            if (!selectedWeek) {
                setWeekItems([]);
                navigate("/admin/weeks", {
                    replace: true,
                    state: { error: "Failed to fetch week" },
                });
                return;
            }

            if (
                selectedWeek?.faculty?.id &&
                selectedWeek.department?.id &&
                selectedWeek.year?.id
            ) {
                const scopedResponse = await getWeeks({
                    data: {
                        faculty_id: selectedWeek.faculty.id,
                        department_id: selectedWeek.department.id,
                        year_id: selectedWeek.year.id,
                    },
                    order_by: ["start_date"],
                    limit: 1e6,
                }).unwrap();
                const scopedWeeks = scopedResponse.data || [];
                setWeeks(
                    scopedWeeks.some((item) => item.id === selectedWeek.id)
                        ? scopedWeeks
                        : [selectedWeek, ...scopedWeeks],
                );
            } else {
                setWeeks([selectedWeek]);
            }

            if (!selectedWeek?.id) {
                setWeekItems([]);
                return;
            }

            setWeekItems(selectedWeek.week_items || []);
        } catch (error) {
            if (weekId) {
                navigate("/admin/weeks", {
                    replace: true,
                    state: {
                        error: getErrorMessage(error) || "Failed to fetch week",
                    },
                });
            } else {
                handlePopupErrors(error);
            }
        }
    }, [
        getWeeks,
        weekId,
        navigate,
        user?.faculty?.id,
        user?.department?.id,
        user?.year?.id,
    ]);

    useAuthQuery(fetchWeek);

    const orderedWeeks = [...weeks].sort((first, second) =>
        (first.start_date || "").localeCompare(second.start_date || ""),
    );
    const currentIndex =
        weekId === null
            ? -1
            : orderedWeeks.findIndex((item) => item.id === weekId);

    const handleWeekChange = (amount: number) => {
        if (orderedWeeks.length === 0) return;
        const nextIndex =
            currentIndex < 0
                ? amount > 0
                    ? 0
                    : orderedWeeks.length - 1
                : currentIndex + amount;
        const nextWeek = orderedWeeks[nextIndex];
        if (nextWeek?.id !== undefined) {
            navigate(`/admin/weeks/${nextWeek.id}`);
        }
    };

    const weekItemsBySubject = useMemo(() => {
        const grouped = new Map<string, WeekItemResponseDto[]>();
        (weekItems || []).forEach((weekItem) => {
            const material = weekItem.material;
            const subjectId = material?.subject?.id ?? "other";
            const subjectName = material?.subject?.name || "Other Materials";
            const key = `${subjectId}:${subjectName}`;
            grouped.set(key, [...(grouped.get(key) || []), weekItem]);
        });
        return Array.from(grouped.values()).map(
            (items) =>
                [
                    items[0]?.material?.subject?.name || "Other Materials",
                    items,
                ] as [string, WeekItemResponseDto[]],
        );
    }, [weekItems]);

    const removeWeek = async () => {
        if (!week?.id) return;
        try {
            await deleteWeek({ week_id: week.id }).unwrap();
            const adjacentWeek =
                currentIndex > 0
                    ? orderedWeeks[currentIndex - 1]
                    : orderedWeeks[currentIndex + 1];
            setDeleteOpen(false);
            setWeek(null);
            if (adjacentWeek?.id !== undefined) {
                navigate(`/admin/weeks/${adjacentWeek.id}`, {
                    state: { success: "Week deleted successfully" },
                });
            } else {
                navigate("/admin/weeks", {
                    state: { success: "Week deleted successfully" },
                });
            }
            showToast("success", "Deleted", "Week deleted successfully");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Week Management - CU Portal"
                description="Manage week course materials"
            />
            <SubBanner
                title={week ? `Week ${week.week_number ?? ""}` : "Week"}
                description={
                    week
                        ? `${week.faculty?.name || ""} · ${week.department?.name || ""} · ${week.year?.year || ""}`
                        : "View week course materials"
                }
                linkText="Back to Weeks"
                linkTo="/admin/weeks"
                button={week ? "Edit Week" : undefined}
                buttonAction={
                    week?.id
                        ? () =>
                              navigate(
                                  buildRedirectUrl(
                                      `/admin/weeks/edit/${week.id}`,
                                  ),
                              )
                        : undefined
                }
                deleteAction={week ? () => setDeleteOpen(true) : undefined}
                deleteButton="Delete Week"
            />
            <main className={styles.container}>
                <section className={styles.panel}>
                    <div className={styles.weekPicker}>
                        <MonthPicker
                            mode="week"
                            weekNumber={week?.week_number ?? undefined}
                            periodLabel={
                                week?.week_number
                                    ? `Week ${week.week_number} (${formatDate(week.start_date, false)} - ${formatDate(getWeekEndDate(week.start_date), false)})`
                                    : orderedWeeks.length > 0
                                      ? "Select a week"
                                      : "No weeks available"
                            }
                            previousDisabled={currentIndex <= 0}
                            nextDisabled={
                                currentIndex < 0
                                    ? orderedWeeks.length === 0
                                    : currentIndex >= orderedWeeks.length - 1
                            }
                            onPeriodChange={(_, amount) =>
                                handleWeekChange(amount)
                            }
                        />
                    </div>
                    {weekItemsBySubject.length > 0 ? (
                        <div className={styles.sectionsList}>
                            {weekItemsBySubject.map(([title, items]) => (
                                <AccordionSection
                                    key={title}
                                    title={title}
                                    weekItems={items}
                                    onRefresh={fetchWeek}
                                    availableWeeks={weeks}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptySection
                            icon="calendar"
                            title="No materials or weeks found for this week."
                        />
                    )}
                </section>
            </main>
            <ConfirmModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={removeWeek}
                confirmText="Delete"
                title="Delete this week?"
                message="This will remove the selected week from the weekly guide."
                colorType="red"
            />
        </Layout>
    );
}

export default WeekPage;
