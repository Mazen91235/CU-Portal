import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { FaChevronUp } from "react-icons/fa";
import { Select } from "../../../components/forms/Select";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { useAppSelector } from "../../../services/redux/Hooks";
import {
    useCreateWeekMutation,
    useDeleteWeekMutation,
    useLazyGetWeeksQuery,
    useUpdateWeekMutation,
} from "../../../services/apis/admin/WeekAPIs";
import { useUpdateMaterialMutation } from "../../../services/apis/admin/MaterialAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import useAuthQuery from "../../../hooks/useAuthQuery";
import styles from "./WeekPage.module.css";

const getWeekStartDates = (start: string, end: string) => {
    if (!start || !end || end < start) return [];

    const startDate = new Date(`${start}T00:00:00Z`);
    const endDate = new Date(`${end}T00:00:00Z`);
    const days =
        Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
    const count = Math.ceil(days / 7);

    return Array.from({ length: count }, (_, index) => {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + index * 7);
        return date.toISOString().slice(0, 10);
    });
};

const countWeeks = (start: string, end: string) =>
    getWeekStartDates(start, end).length;

const getWeekEndDate = (startDate?: string | null) => {
    if (!startDate) return null;
    const date = new Date(formatDateTime(startDate, true));
    date.setUTCDate(date.getUTCDate() + 6);
    return date.toISOString().slice(0, 10);
};

const formatWeekOption = (week: WeekResponseDto) =>
    `Week ${week.week_number ?? ""} (${formatDate(week.start_date, false)} - ${formatDate(getWeekEndDate(week.start_date), false)})`;

function MaterialAdminCard({
    material,
    onRefresh,
    availableWeeks,
    currentWeekId,
}: {
    material: MaterialResponseDto;
    onRefresh: () => Promise<void>;
    availableWeeks: WeekResponseDto[];
    currentWeekId: number;
}) {
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [materialWeekId, setMaterialWeekId] = useState<string>(
        String(material.week?.id ?? currentWeekId),
    );
    const [updateMaterial, { isLoading: isUpdating }] =
        useUpdateMaterialMutation();

    useEffect(() => {
        setMaterialWeekId(String(material.week?.id ?? currentWeekId));
    }, [currentWeekId, material.week?.id]);

    const fileData = material.attachment?.details?.file_data;
    const fileType =
        fileData?.file_type || fileData?.type || material.material_type;
    const isFile = material.material_type === "file";
    const isLink =
        material.material_type === "drive" ||
        material.material_type === "youtube" ||
        material.material_type === "external";

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
            await downloadFile(fileData.id);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleOpenLink = () => {
        const url = material.attachment?.url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    const save = async () => {
        if (!material.id) return;
        try {
            await updateMaterial({
                material_id: material.id,
                name: material.name || "",
                material_type: material.material_type || "file",
                week_id: materialWeekId ? Number(materialWeekId) : null,
                details: {
                    url: material.attachment?.url || "",
                },
            }).unwrap();
            setEditOpen(false);
            await onRefresh();
            showToast("success", "Saved", "Material week updated successfully");
        } catch (error) {
            handlePopupErrors(error);
        }
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
                                onClick={() => setEditOpen(true)}
                            >
                                <i className="fas fa-edit" aria-hidden="true" />
                                Edit
                            </button>
                        </div>

                        <div className={styles.fileActionsMobile}>
                            <MaterialActionsDropdown
                                onShare={() => {}}
                                onMove={() => {}}
                                onCopy={() => {}}
                                onEdit={() => setEditOpen(true)}
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
                                showEdit
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
                    onDownload={() => void handleDownload()}
                />
            )}

            {editOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setEditOpen(false)}
                >
                    <form
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={(event) => {
                            event.preventDefault();
                            void save();
                        }}
                    >
                        <h2>Edit Material Week</h2>
                        <fieldset disabled={isUpdating}>
                            <Select<Record<string, unknown>>
                                name="material_week_id"
                                errors={{}}
                                value={materialWeekId}
                                onChange={(event) =>
                                    setMaterialWeekId(event.target.value)
                                }
                                label="Week"
                            >
                                <option value="">No week</option>
                                {availableWeeks.map((availableWeek) => (
                                    <option
                                        key={availableWeek.id}
                                        value={availableWeek.id || ""}
                                    >
                                        {formatWeekOption(availableWeek)}
                                    </option>
                                ))}
                            </Select>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setEditOpen(false)}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            )}
        </>
    );
}

function AccordionSection({
    title,
    materials,
    availableWeeks,
    onRefresh,
    currentWeekId,
}: {
    title: string;
    materials: MaterialResponseDto[];
    availableWeeks: WeekResponseDto[];
    onRefresh: () => Promise<void>;
    currentWeekId: number;
}) {
    const [open, setOpen] = useState(true);
    const count = materials.length;

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
                    {materials.map((material) => (
                        <MaterialAdminCard
                            key={material.id}
                            material={material}
                            onRefresh={onRefresh}
                            availableWeeks={availableWeeks}
                            currentWeekId={currentWeekId}
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
    const [weekMaterials, setWeekMaterials] = useState<MaterialResponseDto[]>(
        [],
    );
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [editDate, setEditDate] = useState("");
    const [getWeeks] = useLazyGetWeeksQuery();
    const [createWeek] = useCreateWeekMutation();
    const [updateWeek] = useUpdateWeekMutation();
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
                setWeekMaterials([]);
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
                    "materials",
                    "materials.subject",
                    "materials.attachment",
                ],
                limit: 1,
            }).unwrap();

            const selectedWeek = selectedResponse.data?.[0] || null;
            setWeek(selectedWeek);

            if (!selectedWeek) {
                setWeekMaterials([]);
                navigate("/admin/weeks", { replace: true });
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
                setWeekMaterials([]);
                return;
            }

            setWeekMaterials(selectedWeek.materials || []);
        } catch (error) {
            handlePopupErrors(error);
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

    const weekNumbers = weeks
        .map((item) => item.week_number)
        .filter(
            (value): value is number => value !== null && value !== undefined,
        )
        .sort((first, second) => first - second);
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

    const materialsBySubject = useMemo(() => {
        const grouped = new Map<string, MaterialResponseDto[]>();
        (weekMaterials || []).forEach((material) => {
            const subjectId = material.subject?.id ?? "other";
            const subjectName = material.subject?.name || "Other Materials";
            const key = `${subjectId}:${subjectName}`;
            grouped.set(key, [...(grouped.get(key) || []), material]);
        });
        return Array.from(grouped.entries()).map(
            ([, materials]) =>
                [
                    materials[0]?.subject?.name || "Other Materials",
                    materials,
                ] as [string, MaterialResponseDto[]],
        );
    }, [weekMaterials]);

    const createWeeks = async () => {
        const weekStartDates = getWeekStartDates(startDate, endDate);
        const totalWeeks = weekStartDates.length;
        if (
            !totalWeeks ||
            !user?.faculty?.id ||
            !user.department?.id ||
            !user.year?.id
        ) {
            showToast(
                "error",
                "Invalid data",
                "Select a valid date range and ensure your academic profile is complete.",
            );
            return;
        }
        const facultyId = user.faculty.id;
        const departmentId = user.department.id;
        const yearId = user.year.id;
        try {
            const firstWeekNumber = Math.max(0, ...weekNumbers) + 1;
            await Promise.all(
                weekStartDates.map((startDateValue, index) =>
                    createWeek({
                        week_number: firstWeekNumber + index,
                        start_date: `${startDateValue}T00:00:00.000Z`,
                        faculty_id: facultyId,
                        department_id: departmentId,
                        year_id: yearId,
                    }).unwrap(),
                ),
            );
            setCreateOpen(false);
            setStartDate("");
            setEndDate("");
            await fetchWeek();
            showToast(
                "success",
                "Created",
                `${totalWeeks} week${totalWeeks === 1 ? "" : "s"} created successfully`,
            );
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const saveWeek = async () => {
        if (!week?.id || !editDate) return;
        try {
            await updateWeek({
                week_id: week.id,
                week_number: week.week_number || 1,
                start_date: `${editDate}T00:00:00.000Z`,
                faculty_id: week.faculty?.id || user?.faculty?.id || 0,
                department_id: week.department?.id || user?.department?.id || 0,
                year_id: week.year?.id || user?.year?.id || 0,
            }).unwrap();
            setEditOpen(false);
            await fetchWeek();
            showToast("success", "Saved", "Week updated successfully");
        } catch (error) {
            handlePopupErrors(error);
        }
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
                navigate(`/admin/weeks/${adjacentWeek.id}`);
            } else {
                navigate("/admin/weeks");
            }
            showToast("success", "Deleted", "Week deleted successfully");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Weekly Guide - Admin - CU Portal"
                description="Manage weekly course materials"
            />
            <SubBanner
                title={week ? `Week ${week.week_number ?? ""}` : "Week"}
                description={
                    week
                        ? `${week.faculty?.name || ""} · ${week.department?.name || ""} · ${week.year?.year || ""}`
                        : "View weekly course materials"
                }
                linkText="Back to Weeks"
                linkTo="/admin/weeks"
                button={week ? "Edit Week" : undefined}
                buttonAction={
                    week?.id
                        ? () => navigate(`/admin/weeks/edit/${week.id}`)
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
                    {materialsBySubject.length > 0 ? (
                        <div className={styles.sectionsList}>
                            {materialsBySubject.map(([title, materials]) => (
                                <AccordionSection
                                    key={title}
                                    title={title}
                                    materials={materials}
                                    onRefresh={fetchWeek}
                                    availableWeeks={weeks}
                                    currentWeekId={week?.id || 0}
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

            {createOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setCreateOpen(false)}
                >
                    <form
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={(event) => {
                            event.preventDefault();
                            void createWeeks();
                        }}
                    >
                        <h2>Create Weeks</h2>
                        <label>
                            Start date
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                                required
                            />
                        </label>
                        <label>
                            End date
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(event) =>
                                    setEndDate(event.target.value)
                                }
                                required
                            />
                        </label>
                        <label>
                            Weeks to create
                            <input
                                value={countWeeks(startDate, endDate)}
                                disabled
                            />
                        </label>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit">Create</button>
                        </div>
                    </form>
                </div>
            )}
            {editOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setEditOpen(false)}
                >
                    <form
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={(event) => {
                            event.preventDefault();
                            void saveWeek();
                        }}
                    >
                        <h2>Edit Week</h2>
                        <label>
                            Start date
                            <input
                                type="date"
                                value={editDate}
                                onChange={(event) =>
                                    setEditDate(event.target.value)
                                }
                                required
                            />
                        </label>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit">Save</button>
                        </div>
                    </form>
                </div>
            )}
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
