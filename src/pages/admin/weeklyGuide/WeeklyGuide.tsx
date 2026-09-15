import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Banner } from "../../../components/banner/Banner";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import {
  formatWeekLabel,
  MonthPicker,
} from "../../../components/timeline/MonthPicker";
import { Preview } from "../../../components/preview/Preview";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";
import { downloadFile } from "../../../utils/FileDownloader";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import { formatTimeAgo } from "../../../utils/Formatter";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { useAppSelector } from "../../../services/redux/Hooks";
import {
  useCreateWeekMutation,
  useDeleteWeekMutation,
  useLazyGetWeeksQuery,
  useUpdateWeekMutation,
} from "../../../services/apis/admin/WeekAPIs";
import {
  useDeleteMaterialsMutation,
  useLazyGetMaterialsQuery,
  useUpdateMaterialMutation,
} from "../../../services/apis/admin/MaterialAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import useAuthQuery from "../../../hooks/useAuthQuery";
import styles from "./WeeklyGuide.module.css";

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

function MaterialAdminCard({
  material,
  onRefresh,
}: {
  material: MaterialResponseDto;
  onRefresh: () => Promise<void>;
}) {
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(material.name || "");
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterials] = useDeleteMaterialsMutation();

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
      setPreviewFile({ id: fileData.id, name: material.name || "Preview" });
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
    if (!material.id || !name.trim()) return;
    try {
      await updateMaterial({
        material_id: material.id,
        name: name.trim(),
        material_type: material.material_type || "file",
      }).unwrap();
      setEditOpen(false);
      await onRefresh();
      showToast("success", "Saved", "Material updated successfully");
    } catch (error) {
      handlePopupErrors(error);
    }
  };

  const remove = async () => {
    if (!material.id) return;
    try {
      await deleteMaterials({ material_ids: [material.id] }).unwrap();
      await onRefresh();
      showToast("success", "Deleted", "Material deleted successfully");
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
              {formatTimeAgo(material.updated_at || material.created_at || "")}
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
                    <i className="fas fa-eye" aria-hidden="true" />
                    View
                  </button>
                  <button
                    type="button"
                    className={styles.fileActionButton}
                    onClick={() => void handleDownload()}
                  >
                    <i className="fas fa-download" aria-hidden="true" />
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
                  <i className="fas fa-external-link" aria-hidden="true" />
                  Open
                </button>
              )}
              <button
                type="button"
                className={`${styles.fileActionButton} ${styles.deleteActionButton}`}
                onClick={() => void remove()}
              >
                <i className="fas fa-trash" aria-hidden="true" />
                Delete
              </button>
            </div>

            <div className={styles.fileActionsMobile}>
              <MaterialActionsDropdown
                onShare={() => {}}
                onMove={() => {}}
                onCopy={() => {}}
                onEdit={() => setEditOpen(true)}
                onDelete={() => void remove()}
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
                showDelete
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
        <div className={styles.modalOverlay} onClick={() => setEditOpen(false)}>
          <form
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <h2>Edit Material</h2>
            <label>
              Material name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export function WeeklyGuidePage() {
  const { weekNumber: routeWeekNumber } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const parsedWeekNumber = Number(routeWeekNumber);
  const weekNumber =
    Number.isInteger(parsedWeekNumber) && parsedWeekNumber > 0
      ? parsedWeekNumber
      : null;
  const [week, setWeek] = useState<WeekResponseDto | null>(null);
  const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
  const [weekMaterials, setWeekMaterials] = useState<MaterialResponseDto[]>([]);
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
  const [getMaterials] = useLazyGetMaterialsQuery();

  const fetchWeek = useCallback(async () => {
    try {
      const academicWeekFilter = {
        faculty_id: user?.faculty?.id || undefined,
        department_id: user?.department?.id || undefined,
        year_id: user?.year?.id || undefined,
      };
      const weeksResponse = await getWeeks({
        data: academicWeekFilter,
        order_by: ["week_number"],
        limit: 1000,
      }).unwrap();
      setWeeks(weeksResponse.data || []);

      if (!weekNumber) {
        setWeek(null);
        setWeekMaterials([]);
        if (weeksResponse.data?.[0]?.week_number) {
          navigate(`/admin/week-guide/${weeksResponse.data[0].week_number}`, {
            replace: true,
          });
        }
        return;
      }

      const selectedResponse = await getWeeks({
        data: { ...academicWeekFilter, week_number: weekNumber },
        limit: 1,
      }).unwrap();

      const selectedWeek = selectedResponse.data?.[0] || null;
      setWeek(selectedWeek);

      if (!selectedWeek && weeksResponse.data?.[0]?.week_number) {
        setWeekMaterials([]);
        navigate(`/admin/week-guide/${weeksResponse.data[0].week_number}`, {
          replace: true,
        });
        return;
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
    } catch (error) {
      handlePopupErrors(error);
    }
  }, [
    getWeeks,
    weekNumber,
    navigate,
    user?.faculty?.id,
    user?.department?.id,
    user?.year?.id,
    getMaterials,
  ]);

  useAuthQuery(fetchWeek);

  const weekNumbers = weeks
    .map((item) => item.week_number)
    .filter((value): value is number => value !== null && value !== undefined)
    .sort((first, second) => first - second);
  const currentIndex =
    weekNumber === null ? -1 : weekNumbers.indexOf(weekNumber);

  const handleWeekChange = (amount: number) => {
    if (weekNumbers.length === 0) return;
    const nextIndex =
      currentIndex < 0
        ? amount > 0
          ? 0
          : weekNumbers.length - 1
        : currentIndex + amount;
    const nextWeekNumber = weekNumbers[nextIndex];
    if (nextWeekNumber !== undefined) {
      navigate(`/admin/week-guide/${nextWeekNumber}`);
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
        [materials[0]?.subject?.name || "Other Materials", materials] as [
          string,
          MaterialResponseDto[],
        ],
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
            start_date: startDateValue,
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
        week_number: week.week_number || weekNumber || 1,
        start_date: editDate,
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
      const adjacentWeekNumber =
        currentIndex > 0
          ? weekNumbers[currentIndex - 1]
          : weekNumbers[currentIndex + 1];
      setDeleteOpen(false);
      setWeek(null);
      if (adjacentWeekNumber !== undefined) {
        navigate(`/admin/week-guide/${adjacentWeekNumber}`);
      } else {
        navigate("/admin/week-guide");
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
      <Banner
        title="Weekly Guide"
        description="Manage weekly course materials"
        button="Create Weeks"
        buttonAction={() => setCreateOpen(true)}
        secondaryButton="Edit Week"
        secondaryButtonAction={() => {
          setEditDate(week?.start_date || "");
          setEditOpen(true);
        }}
      />
      <main className={styles.container}>
        <section className={styles.panel}>
          <div className={styles.weekPicker}>
            <MonthPicker
              mode="week"
              weekNumber={weekNumber ?? undefined}
              periodLabel={
                week?.week_number
                  ? formatWeekLabel(week.week_number, week.start_date)
                  : weeks.length > 0
                    ? "Select a week"
                    : "No weeks available"
              }
              previousDisabled={currentIndex <= 0}
              nextDisabled={
                currentIndex < 0
                  ? weekNumbers.length === 0
                  : currentIndex >= weekNumbers.length - 1
              }
              onPeriodChange={(_, amount) => handleWeekChange(amount)}
            />
            {week && (
              <button
                className={styles.deleteButton}
                onClick={() => setDeleteOpen(true)}
              >
                Delete Week
              </button>
            )}
          </div>
          {materialsBySubject.length > 0 ? (
            materialsBySubject.map(([title, materials]) => (
              <section className={styles.section} key={title}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.materialGrid}>
                  {materials.map((material) => (
                    <MaterialAdminCard
                      key={material.id}
                      material={material}
                      onRefresh={fetchWeek}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className={styles.empty}>
              No materials or weeks found for this week.
            </p>
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
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </label>
            <label>
              Weeks to create
              <input value={countWeeks(startDate, endDate)} disabled />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
      )}
      {editOpen && (
        <div className={styles.modalOverlay} onClick={() => setEditOpen(false)}>
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
                onChange={(event) => setEditDate(event.target.value)}
                required
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setEditOpen(false)}>
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

export default WeeklyGuidePage;
