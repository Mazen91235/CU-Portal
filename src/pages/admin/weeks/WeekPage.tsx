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
import {
    formatDate,
    formatDateTime,
    formatTimeAgo,
} from "../../../utils/Formatter";
import { Button } from "../../../components/forms/Button";
import { FaChevronUp } from "react-icons/fa";
import { WeekItemsEditor } from "../../../components/materials/WeekItemsEditor";
import {
    getWeekDateTimeRange,
    getWeekEndDate,
} from "../../../utils/WeekHelpers";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import {
    useDeleteWeekMutation,
    useLazyGetWeekQuery,
    useLazyGetWeeksQuery,
} from "../../../services/apis/admin/WeekAPIs";
import { useLazyGetTasksQuery } from "../../../services/apis/admin/TaskAPIs";
import { useLazyGetExamsQuery } from "../../../services/apis/admin/ExamAPIs";
import {
    useLazyGetMaterialQuery,
    useLazyGetMaterialsQuery,
    useUpdateMaterialMutation,
} from "../../../services/apis/admin/MaterialAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
import type { ExamResponseDto } from "../../../types/dtos/ExamDtos";
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
import taskIcon from "../../../assets/icons/task-icon.png";
import examIcon from "../../../assets/icons/exam-icon.png";

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
                                <Button
                                    text="Cancel"
                                    loadingText="Saving..."
                                    type="button"
                                    onClick={() => setEditOpen(false)}
                                    isSubmitting={isUpdating}
                                    isSecondary
                                />
                                <Button
                                    text="Update"
                                    loadingText="Saving..."
                                    isOrange={false}
                                    type="button"
                                    onClick={() => void save()}
                                    isSubmitting={isUpdating}
                                />
                            </div>
                        </fieldset>
                    </div>
                </div>
            )}
        </>
    );
}

type WeeklyActivity =
    | { type: "exam"; item: ExamResponseDto }
    | { type: "task"; item: TaskResponseDto };

type SubjectSection = {
    key: string;
    title: string;
    exams: ExamResponseDto[];
    tasks: TaskResponseDto[];
    weekItems: WeekItemResponseDto[];
};

function WeeklyActivityCard({
    activity,
    onView,
}: {
    activity: WeeklyActivity;
    onView: () => void;
}) {
    const isExam = activity.type === "exam";
    const item = activity.item;

    return (
        <article className={styles.fileCard}>
            <div className={styles.fileMain}>
                <div className={styles.fileInfo}>
                    <img
                        src={isExam ? examIcon : taskIcon}
                        alt=""
                        className={styles.fileIcon}
                    />
                    <div className={styles.fileText}>
                        <span className={styles.fileName}>
                            {item.name ||
                                (isExam ? "Untitled Exam" : "Untitled Task")}
                        </span>
                        <span className={styles.fileMeta}>
                            Due: {formatDateTime(item.deadline)}
                        </span>
                    </div>
                </div>

                <div className={styles.fileActions}>
                    <button
                        type="button"
                        className={styles.fileActionButton}
                        onClick={onView}
                    >
                        <i className="fas fa-eye" aria-hidden="true" />
                        View
                    </button>
                </div>

                <div className={styles.fileActionsMobile}>
                    <MaterialActionsDropdown
                        onShare={() => {}}
                        onMove={() => {}}
                        onCopy={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onView={onView}
                        showShare={false}
                        showMove={false}
                        showCopy={false}
                        showEdit={false}
                        showDelete={false}
                        showDownload={false}
                    />
                </div>
            </div>
        </article>
    );
}

function AccordionSection({
    title,
    exams,
    tasks,
    weekItems,
    availableWeeks,
    onRefresh,
    onViewTask,
    onViewExam,
}: {
    title: string;
    exams: ExamResponseDto[];
    tasks: TaskResponseDto[];
    weekItems: WeekItemResponseDto[];
    availableWeeks: WeekResponseDto[];
    onRefresh: () => Promise<void>;
    onViewTask: (taskId: number) => void;
    onViewExam: (examId: number) => void;
}) {
    const [open, setOpen] = useState(true);
    const count = exams.length + tasks.length + weekItems.length;

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
                    className={`${styles.chevron} ${
                        open ? styles.chevronOpen : ""
                    }`}
                >
                    <FaChevronUp aria-hidden="true" />
                </span>
            </button>
            {open && count > 0 && (
                <div className={styles.sectionBody}>
                    {exams.map((exam) => (
                        <WeeklyActivityCard
                            key={`exam-${exam.id}`}
                            activity={{ type: "exam", item: exam }}
                            onView={() => {
                                if (exam.id != null) onViewExam(exam.id);
                            }}
                        />
                    ))}
                    {tasks.map((task) => (
                        <WeeklyActivityCard
                            key={`task-${task.id}`}
                            activity={{ type: "task", item: task }}
                            onView={() => {
                                if (task.id != null) onViewTask(task.id);
                            }}
                        />
                    ))}
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
    const parsedWeekId = Number(routeWeekId);
    const weekId =
        Number.isInteger(parsedWeekId) && parsedWeekId > 0
            ? parsedWeekId
            : null;
    const [week, setWeek] = useState<WeekResponseDto | null>(null);
    const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
    const [weekItems, setWeekItems] = useState<WeekItemResponseDto[]>([]);
    const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
    const [exams, setExams] = useState<ExamResponseDto[]>([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [getWeek] = useLazyGetWeekQuery();
    const [getWeeks] = useLazyGetWeeksQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getTasks] = useLazyGetTasksQuery();
    const [getExams] = useLazyGetExamsQuery();
    const [deleteWeek] = useDeleteWeekMutation();

    const fetchWeek = useCallback(async () => {
        try {
            if (!weekId) {
                const weeksResponse = await getWeeks({
                    data: {},
                    order_by: ["start_date"],
                    descending: true,
                    limit: 1e6,
                }).unwrap();
                setWeeks(weeksResponse.data || []);
                setWeek(null);
                setWeekItems([]);
                setTasks([]);
                setExams([]);
                if (weeksResponse.data?.[0]?.id) {
                    navigate(`/admin/weeks/${weeksResponse.data[0].id}`, {
                        replace: true,
                    });
                }
                return;
            }

            const selectedResponse = await getWeek({
                week_id: weekId,
            }).unwrap();

            const selectedWeek = selectedResponse.data || null;
            setWeek(selectedWeek);

            if (!selectedWeek) {
                setWeekItems([]);
                setTasks([]);
                setExams([]);
                navigate("/admin/weeks", {
                    replace: true,
                    state: { error: "Failed to fetch week" },
                });
                return;
            }

            const weeksResponse = await getWeeks({
                data: {},
                order_by: ["start_date"],
                limit: 1e6,
            }).unwrap();
            setWeeks(weeksResponse.data || []);

            if (!selectedWeek?.id) {
                setWeekItems([]);
                setTasks([]);
                setExams([]);
                return;
            }

            setWeekItems([]);
            setTasks([]);
            setExams([]);

            const { from, to } = getWeekDateTimeRange(selectedWeek.start_date);
            const [materialsResponse, tasksResponse, examsResponse] =
                await Promise.all([
                    getMaterials({
                        data: { week_id: selectedWeek.id },
                        includes: ["subject", "attachment", "week_items.week"],
                        order_by: ["created_at"],
                        descending: false,
                        limit: 1e6,
                    }).unwrap(),
                    getTasks({
                        data: {
                            deadline_from: from,
                            deadline_to: to,
                        },
                        includes: ["subject"],
                        order_by: ["deadline_nearest"],
                        limit: 1e6,
                    }).unwrap(),
                    getExams({
                        data: {
                            deadline_from: from,
                            deadline_to: to,
                        },
                        includes: ["subject"],
                        order_by: ["deadline_nearest"],
                        limit: 1e6,
                    }).unwrap(),
                ]);

            setWeekItems(
                (materialsResponse.data || []).flatMap((material) =>
                    (material.week_items || [])
                        .filter(
                            (weekItem) => weekItem.week?.id === selectedWeek.id,
                        )
                        .map((weekItem) => ({ ...weekItem, material })),
                ),
            );
            setTasks(tasksResponse.data || []);
            setExams(examsResponse.data || []);
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
    }, [getExams, getMaterials, getTasks, getWeek, getWeeks, weekId, navigate]);

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
        const grouped = new Map<string, SubjectSection>();

        const ensureSection = (subjectId: number | string, title: string) => {
            const key = String(subjectId);
            const existing = grouped.get(key);
            if (existing) return existing;
            const section: SubjectSection = {
                key,
                title,
                exams: [],
                tasks: [],
                weekItems: [],
            };
            grouped.set(key, section);
            return section;
        };

        weekItems.forEach((weekItem) => {
            const subjectId = weekItem.material?.subject?.id ?? "other";
            const title = weekItem.material?.subject?.name || "Other Materials";
            ensureSection(subjectId, title).weekItems.push(weekItem);
        });
        exams.forEach((exam) => {
            const subjectId = exam.subject?.id ?? "other";
            const title = exam.subject?.name || "Other Materials";
            ensureSection(subjectId, title).exams.push(exam);
        });
        tasks.forEach((task) => {
            const subjectId = task.subject?.id ?? "other";
            const title = task.subject?.name || "Other Materials";
            ensureSection(subjectId, title).tasks.push(task);
        });

        return Array.from(grouped.values());
    }, [exams, tasks, weekItems]);

    const handleViewTask = (taskId: number) => {
        navigate(buildRedirectUrl(`/admin/tasks/${taskId}`));
    };

    const handleViewExam = (examId: number) => {
        navigate(buildRedirectUrl(`/admin/exams/${examId}`));
    };

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
                description="View week course materials"
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
                            {weekItemsBySubject.map((section) => (
                                <AccordionSection
                                    key={section.key}
                                    title={section.title}
                                    exams={section.exams}
                                    tasks={section.tasks}
                                    weekItems={section.weekItems}
                                    onRefresh={fetchWeek}
                                    availableWeeks={weeks}
                                    onViewTask={handleViewTask}
                                    onViewExam={handleViewExam}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptySection
                            icon="calendar"
                            title="No materials, tasks, or exams found for this week."
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
