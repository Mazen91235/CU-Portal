import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import styles from "./WeekPage.module.css";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { SubBanner } from "../../../components/banner/SubBanner";
import { PageSeo } from "../../../components/PageSeo";
import { Preview } from "../../../components/preview/Preview";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";
import { downloadFile } from "../../../utils/FileDownloader";
import {
    getErrorMessage,
    handlePopupErrors,
} from "../../../utils/ErrorHandling";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import {
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatString,
} from "../../../utils/Formatter";
import { FaChevronUp } from "react-icons/fa";
import { MonthPicker } from "../../../components/timeline/MonthPicker";
import { EmptySection } from "../../../components/calendar/EmptySection";
import {
    useLazyGetWeekQuery,
    useLazyGetWeeksQuery,
} from "../../../services/apis/user/WeekAPIs";
import { useLazyGetMaterialsQuery } from "../../../services/apis/user/MaterialAPIs";
import { useLazyGetTasksQuery } from "../../../services/apis/user/TaskAPIs";
import { useLazyGetExamsQuery } from "../../../services/apis/user/ExamAPIs";
import {
    useCreateUserCompletionMutation,
    useDeleteUserCompletionMutation,
    useLazyGetUserCompletionsQuery,
} from "../../../services/apis/user/UserCompletionAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
import type { ExamResponseDto } from "../../../types/dtos/ExamDtos";
import type { UserCompletionResponseDto } from "../../../types/dtos/UserCompletionDtos";
import {
    getWeekDateTimeRange,
    getWeekEndDate,
} from "../../../utils/WeekHelpers";
import type { WeekItemResponseDto } from "../../../types/dtos/WeekItemDtos";
import taskIcon from "../../../assets/icons/task-icon.png";
import examIcon from "../../../assets/icons/exam-icon.png";

type WeeklyActivity =
    | { type: "exam"; item: ExamResponseDto }
    | { type: "task"; item: TaskResponseDto };

type CompletionMap = Record<string, UserCompletionResponseDto>;

type SubjectSection = {
    key: string;
    title: string;
    exams: ExamResponseDto[];
    tasks: TaskResponseDto[];
    weekItems: WeekItemResponseDto[];
};

const getCompletionKey = (
    activity: WeeklyActivity | WeekItemResponseDto,
): string | null => {
    if ("type" in activity) {
        return activity.item.id != null ? `task:${activity.item.id}` : null;
    }
    return activity.id != null ? `week-item:${activity.id}` : null;
};

function CompletionButton({
    completed,
    pending,
    onClick,
}: {
    completed: boolean;
    pending: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.completionButton} ${
                completed ? styles.completionButtonCompleted : ""
            }`}
            onClick={onClick}
            disabled={pending}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
            title={completed ? "Mark as incomplete" : "Mark as complete"}
        >
            {completed && <span aria-hidden="true">✓</span>}
        </button>
    );
}

function WeeklyMaterialCard({
    item,
    completion,
    pending,
    onToggleCompletion,
}: {
    item: WeekItemResponseDto;
    completion?: UserCompletionResponseDto;
    pending: boolean;
    onToggleCompletion: () => void;
}) {
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const material = item.material;
    if (!material) return null;

    const fileData = material.attachment?.details?.file_data;
    const fileType =
        fileData?.file_type || fileData?.type || material.material_type;
    const isFile = material.material_type === "file";
    const isLink =
        material.material_type === "drive" ||
        material.material_type === "youtube" ||
        material.material_type === "external";
    const completed = Boolean(completion);

    const handlePreview = () => {
        if (fileData?.id) {
            setPreviewFile({
                id: fileData.id,
                name: material.name || "Preview",
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
        const url = material.attachment?.url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <>
            <article className={styles.fileCard}>
                <div className={styles.fileMain}>
                    <div className={styles.fileInfo}>
                        <CompletionButton
                            completed={completed}
                            pending={pending}
                            onClick={onToggleCompletion}
                        />
                        <img
                            src={getFileIcon(fileType || undefined)}
                            alt=""
                            className={`${styles.fileIcon} ${
                                completed ? styles.fileIconCompleted : ""
                            }`}
                        />
                        <div className={styles.fileText}>
                            <span
                                className={`${styles.fileName} ${
                                    completed ? styles.fileNameCompleted : ""
                                }`}
                            >
                                {formatString(
                                    material.name || "Unnamed material",
                                    "CardTitle",
                                )}
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
                                            Preview
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
                            </div>

                            <div className={styles.fileActionsMobile}>
                                <MaterialActionsDropdown
                                    onShare={() => {}}
                                    onMove={() => {}}
                                    onCopy={() => {}}
                                    onEdit={() => {}}
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
                                    showEdit={false}
                                    showDelete={false}
                                    showDownload={
                                        isFile && Boolean(fileData?.id)
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
                {item.note?.trim() && (
                    <div className={styles.itemNote}>
                        {formatString(item.note, "Content")}
                    </div>
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

function WeeklyActivityCard({
    activity,
    completion,
    pending,
    onToggleCompletion,
    onView,
}: {
    activity: WeeklyActivity;
    completion?: UserCompletionResponseDto;
    pending: boolean;
    onToggleCompletion: () => void;
    onView: () => void;
}) {
    const completed = Boolean(completion);
    const isExam = activity.type === "exam";
    const item = activity.item;

    return (
        <article className={styles.fileCard}>
            <div className={styles.fileMain}>
                <div className={styles.fileInfo}>
                    <CompletionButton
                        completed={completed}
                        pending={pending}
                        onClick={onToggleCompletion}
                    />
                    <img
                        src={isExam ? examIcon : taskIcon}
                        alt=""
                        className={`${styles.fileIcon} ${
                            completed ? styles.fileIconCompleted : ""
                        }`}
                    />
                    <div className={styles.fileText}>
                        <span
                            className={`${styles.fileName} ${
                                completed ? styles.fileNameCompleted : ""
                            }`}
                        >
                            {formatString(
                                item.name ||
                                    (isExam
                                        ? "Untitled Exam"
                                        : "Untitled Task"),
                                "CardTitle",
                            )}
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
    completions,
    pendingCompletionKeys,
    onToggleCompletion,
    onViewTask,
    onViewExam,
}: {
    title: string;
    exams: ExamResponseDto[];
    tasks: TaskResponseDto[];
    weekItems: WeekItemResponseDto[];
    completions: CompletionMap;
    pendingCompletionKeys: Set<string>;
    onToggleCompletion: (item: WeeklyActivity | WeekItemResponseDto) => void;
    onViewTask: (taskId: number) => void;
    onViewExam: (examId: number) => void;
}) {
    const [open, setOpen] = useState(true);
    const totalCount = exams.length + tasks.length + weekItems.length;
    const remainingCount = [
        ...exams.map((exam) => ({ type: "exam" as const, item: exam })),
        ...tasks.map((task) => ({ type: "task" as const, item: task })),
        ...weekItems,
    ].filter((item) => {
        const key = getCompletionKey(item);
        return key ? !completions[key] : true;
    }).length;

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
                        ({remainingCount}{" "}
                        {remainingCount === 1 ? "Item" : "Items"} Remaining)
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

            {open && totalCount > 0 && (
                <div className={styles.sectionBody}>
                    {exams.map((exam) => {
                        const activity: WeeklyActivity = {
                            type: "exam",
                            item: exam,
                        };
                        const key = getCompletionKey(activity);
                        return (
                            <WeeklyActivityCard
                                key={`exam-${exam.id}`}
                                activity={activity}
                                completion={key ? completions[key] : undefined}
                                pending={
                                    key ? pendingCompletionKeys.has(key) : false
                                }
                                onToggleCompletion={() =>
                                    onToggleCompletion(activity)
                                }
                                onView={() => {
                                    if (exam.id != null) onViewExam(exam.id);
                                }}
                            />
                        );
                    })}
                    {tasks.map((task) => {
                        const activity: WeeklyActivity = {
                            type: "task",
                            item: task,
                        };
                        const key = getCompletionKey(activity);
                        return (
                            <WeeklyActivityCard
                                key={`task-${task.id}`}
                                activity={activity}
                                completion={key ? completions[key] : undefined}
                                pending={
                                    key ? pendingCompletionKeys.has(key) : false
                                }
                                onToggleCompletion={() =>
                                    onToggleCompletion(activity)
                                }
                                onView={() => {
                                    if (task.id != null) onViewTask(task.id);
                                }}
                            />
                        );
                    })}
                    {weekItems.map((item) => {
                        const key = getCompletionKey(item);
                        return (
                            <WeeklyMaterialCard
                                key={`week-item-${item.id ?? item.material?.id}`}
                                item={item}
                                completion={key ? completions[key] : undefined}
                                pending={
                                    key ? pendingCompletionKeys.has(key) : false
                                }
                                onToggleCompletion={() =>
                                    onToggleCompletion(item)
                                }
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function WeekMaterials({
    weekNumber,
    weekItems,
    tasks,
    exams,
    completions,
    pendingCompletionKeys,
    onToggleCompletion,
    onWeekChange,
    onViewTask,
    onViewExam,
    isLoading,
    periodLabel,
    previousDisabled,
    nextDisabled,
}: {
    weekItems: WeekItemResponseDto[];
    tasks: TaskResponseDto[];
    exams: ExamResponseDto[];
    completions: CompletionMap;
    pendingCompletionKeys: Set<string>;
    onToggleCompletion: (item: WeeklyActivity | WeekItemResponseDto) => void;
    weekNumber: number;
    onWeekChange: (amount: number) => void;
    onViewTask: (taskId: number) => void;
    onViewExam: (examId: number) => void;
    isLoading: boolean;
    periodLabel?: string;
    previousDisabled: boolean;
    nextDisabled: boolean;
}) {
    const sections = useMemo(() => {
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
                    {sections.map((section) => (
                        <AccordionSection
                            key={section.key}
                            title={section.title}
                            exams={section.exams}
                            tasks={section.tasks}
                            weekItems={section.weekItems}
                            completions={completions}
                            pendingCompletionKeys={pendingCompletionKeys}
                            onToggleCompletion={onToggleCompletion}
                            onViewTask={onViewTask}
                            onViewExam={onViewExam}
                        />
                    ))}
                </div>
            ) : (
                !isLoading && (
                    <EmptySection
                        icon="calendar"
                        title="No materials, tasks, or exams found for this week."
                    />
                )
            )}
        </section>
    );
}

export function WeekPage() {
    const { weekId: routeWeekId } = useParams();
    const navigate = useNavigate();
    const [week, setWeek] = useState<WeekResponseDto | null>(null);
    const [weekItems, setWeekItems] = useState<WeekItemResponseDto[]>([]);
    const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
    const [exams, setExams] = useState<ExamResponseDto[]>([]);
    const [completions, setCompletions] = useState<CompletionMap>({});
    const [pendingCompletionKeys, setPendingCompletionKeys] = useState<
        Set<string>
    >(new Set());
    const [getWeek] = useLazyGetWeekQuery();
    const [getWeeks] = useLazyGetWeeksQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getTasks] = useLazyGetTasksQuery();
    const [getExams] = useLazyGetExamsQuery();
    const [getUserCompletions] = useLazyGetUserCompletionsQuery();
    const [createUserCompletion] = useCreateUserCompletionMutation();
    const [deleteUserCompletion] = useDeleteUserCompletionMutation();

    const fetchWeek = useCallback(async () => {
        try {
            const today = new Date().toLocaleDateString("en-CA");
            let selectedWeek: WeekResponseDto | undefined;

            if (routeWeekId) {
                selectedWeek =
                    (
                        await getWeek({
                            week_id: Number(routeWeekId),
                        }).unwrap()
                    ).data ?? undefined;

                if (!selectedWeek) {
                    navigate("/user/weeks", {
                        state: { error: "Failed to fetch week" },
                    });
                    return;
                }
            } else {
                selectedWeek = (
                    await getWeeks({
                        data: {
                            start_date_includes: today,
                        },
                        order_by: ["start_date"],
                        limit: 1,
                    }).unwrap()
                ).data?.[0];

                if (!selectedWeek) {
                    selectedWeek = (
                        await getWeeks({
                            data: {
                                start_date_to: today,
                            },
                            order_by: ["start_date"],
                            descending: true,
                            limit: 1,
                        }).unwrap()
                    ).data?.[0];
                }

                if (!selectedWeek) {
                    selectedWeek = (
                        await getWeeks({
                            data: {
                                start_date_from: today,
                            },
                            order_by: ["start_date"],
                            limit: 1,
                        }).unwrap()
                    ).data?.[0];
                }
            }

            setWeek(selectedWeek || null);

            if (!routeWeekId && selectedWeek?.id) {
                navigate(`/user/weeks/${selectedWeek.id}`, { replace: true });
            }

            setWeekItems([]);
            setTasks([]);
            setExams([]);
            setCompletions({});

            if (!selectedWeek?.start_date) {
                setTasks([]);
                setExams([]);
                setCompletions({});
                return;
            }

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

            try {
                const completionsResponse = await getUserCompletions({
                    data: {},
                }).unwrap();
                const completionMap: CompletionMap = {};
                (completionsResponse.data || []).forEach((completion) => {
                    if (completion.id == null) return;
                    if (completion.week_item_id != null) {
                        completionMap[`week-item:${completion.week_item_id}`] =
                            completion;
                    }
                    if (completion.task_id != null) {
                        completionMap[`task:${completion.task_id}`] =
                            completion;
                    }
                });
                setCompletions(completionMap);
            } catch (error) {
                setCompletions({});
                handlePopupErrors(error);
            }
        } catch (error) {
            navigate("/user/weeks", {
                state: {
                    error: getErrorMessage(error) || "Failed to fetch week",
                },
            });
        }
    }, [
        getExams,
        getMaterials,
        getTasks,
        getUserCompletions,
        getWeek,
        getWeeks,
        navigate,
        routeWeekId,
    ]);

    useAuthQuery(fetchWeek);

    const toggleCompletion = useCallback(
        async (item: WeeklyActivity | WeekItemResponseDto) => {
            const key = getCompletionKey(item);
            if (!key || pendingCompletionKeys.has(key)) return;

            const completion = completions[key];
            setPendingCompletionKeys((current) => {
                const next = new Set(current);
                next.add(key);
                return next;
            });

            try {
                if (completion?.id != null) {
                    await deleteUserCompletion({
                        user_completion_id: completion.id,
                    }).unwrap();
                    setCompletions((current) => {
                        const next = { ...current };
                        delete next[key];
                        return next;
                    });
                } else {
                    const payload =
                        "type" in item
                            ? { task_id: item.item.id }
                            : { week_item_id: item.id };
                    const response =
                        await createUserCompletion(payload).unwrap();
                    if (response.data?.id != null) {
                        setCompletions((current) => ({
                            ...current,
                            [key]: {
                                ...response.data,
                                ...("type" in item
                                    ? { task_id: item.item.id }
                                    : { week_item_id: item.id }),
                            },
                        }));
                    }
                }
            } catch (error) {
                handlePopupErrors(error);
            } finally {
                setPendingCompletionKeys((current) => {
                    const next = new Set(current);
                    next.delete(key);
                    return next;
                });
            }
        },
        [
            completions,
            createUserCompletion,
            deleteUserCompletion,
            pendingCompletionKeys,
        ],
    );

    const handleViewTask = (taskId: number) => {
        navigate(buildRedirectUrl(`/user/tasks/${taskId}`));
    };

    const handleViewExam = (examId: number) => {
        navigate(buildRedirectUrl(`/user/exams/${examId}`));
    };

    const handleWeekChange = (amount: number) => {
        if (!week?.start_date) return;
        if (amount < 0) {
            const targetDate = new Date(formatDateTime(week.start_date, true));
            targetDate.setUTCDate(targetDate.getUTCDate() - 1);
            void getWeeks({
                data: {
                    start_date_to: targetDate.toISOString().slice(0, 10),
                },
                order_by: ["start_date"],
                descending: true,
                limit: 1,
            })
                .unwrap()
                .then((response) => {
                    if (response.data?.[0]?.id)
                        navigate(`/user/weeks/${response.data[0].id}`);
                });
            return;
        }
        const targetDate = new Date(formatDateTime(week.start_date, true));
        targetDate.setUTCDate(targetDate.getUTCDate() + 7);
        void getWeeks({
            data: {
                start_date_from: targetDate.toISOString().slice(0, 10),
            },
            order_by: ["start_date"],
            limit: 1,
        })
            .unwrap()
            .then((response) => {
                if (response.data?.[0]?.id)
                    navigate(`/user/weeks/${response.data[0].id}`);
            });
    };

    return (
        <Layout>
            <PageSeo
                title="Weekly Guide - CU Portal"
                description="Weekly Guide for students to access their course materials and resources."
            />
            {routeWeekId ? (
                <SubBanner
                    title={
                        week?.week_number
                            ? `Week ${week.week_number}`
                            : "Weekly Guide"
                    }
                    description="Weekly Guide for students to access their course materials and resources."
                    linkText="Back to Weekly Guide"
                    linkTo="/user/weeks"
                />
            ) : (
                <Banner
                    title="My Weekly Guide"
                    description="Weekly Guide for students to access their course materials and resources."
                />
            )}
            <div className={styles.container}>
                <WeekMaterials
                    weekItems={weekItems}
                    tasks={tasks}
                    exams={exams}
                    completions={completions}
                    pendingCompletionKeys={pendingCompletionKeys}
                    onToggleCompletion={toggleCompletion}
                    onViewTask={handleViewTask}
                    onViewExam={handleViewExam}
                    weekNumber={week?.week_number || 0}
                    onWeekChange={handleWeekChange}
                    isLoading={false}
                    periodLabel={
                        week?.week_number
                            ? `Week ${week.week_number} (${formatDate(week.start_date, false)} - ${formatDate(getWeekEndDate(week.start_date), false)})`
                            : "No weeks available"
                    }
                    previousDisabled={!week?.start_date}
                    nextDisabled={!week?.start_date}
                />
            </div>
        </Layout>
    );
}
