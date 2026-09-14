import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import styles from "./weekltGuide.module.css";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { PageSeo } from "../../../components/PageSeo";
import { Preview } from "../../../components/preview/Preview";
import { downloadFile } from "../../../utils/FileDownloader";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import { formatTimeAgo } from "../../../utils/Formatter";
import { FaChevronUp } from "react-icons/fa";
import {
  formatWeekLabel,
  MonthPicker,
} from "../../../components/timeline/MonthPicker";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";
import { EmptySection } from "../../../components/calendar/EmptySection";
import { useLazyGetWeeksQuery } from "../../../services/apis/user/WeekAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";

/* ---------- Types ---------- */

function WeeklyMaterialCard({ item }: { item: MaterialResponseDto }) {
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fileData = item.attachment?.details?.file_data;
  const fileType = fileData?.file_type || fileData?.type || item.material_type;

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
              {formatTimeAgo(item.updated_at || item.created_at || "")}
            </span>
          </div>
        </div>

        {fileData?.id && (
          <div className={styles.fileActions}>
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
              onClick={handleDownload}
            >
              <i className="fas fa-download" aria-hidden="true" />
              Download
            </button>
          </div>
        )}

        {fileData?.id && (
          <div className={styles.fileActionsMobile}>
            <MaterialActionsDropdown
              onShare={() => {}}
              onDownload={handleDownload}
              onMove={() => {}}
              onCopy={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={handlePreview}
              showAll={false}
            />
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
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
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
  week,
  weekNumber,
  onWeekChange,
  isLoading,
  periodLabel,
  previousDisabled,
  nextDisabled,
}: {
  week: WeekResponseDto | null;
  weekNumber: number;
  onWeekChange: (amount: number) => void;
  isLoading: boolean;
  periodLabel?: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
}) {
  const sections = useMemo(() => {
    const grouped = new Map<string, MaterialResponseDto[]>();
    (week?.materials || []).forEach((material) => {
      const title = material.subject?.name || "Other Materials";
      const items = grouped.get(title) || [];
      items.push(material);
      grouped.set(title, items);
    });
    return Array.from(grouped.entries());
  }, [week?.materials]);

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
            <AccordionSection key={title} title={title} materials={materials} />
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
  const { weekNumber: routeWeekNumber } = useParams();
  const [weekNumber, setWeekNumber] = useState(
    Math.max(1, Number(routeWeekNumber) || 1),
  );
  const [week, setWeek] = useState<WeekResponseDto | null>(null);
  const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
  const [getWeeks, { isFetching }] = useLazyGetWeeksQuery();

  const fetchWeek = useCallback(async () => {
    const [selectedResponse, weeksResponse] = await Promise.all([
      getWeeks({
        data: { week_number: weekNumber },
        includes: ["materials", "subject", "attachment"],
      }).unwrap(),
      getWeeks({
        data: {},
        order_by: ["week_number"],
        limit: 1000,
      }).unwrap(),
    ]);
    setWeek(selectedResponse.data?.[0] || null);
    setWeeks(weeksResponse.data || []);
  }, [getWeeks, weekNumber]);

  useAuthQuery(fetchWeek);

  const weekNumbers = weeks
    .map((item) => item.week_number)
    .filter((value): value is number => value !== null && value !== undefined)
    .sort((first, second) => first - second);
  const currentIndex = weekNumbers.indexOf(weekNumber);

  const handleWeekChange = (amount: number) => {
    if (weekNumbers.length === 0) return;
    const nextIndex =
      currentIndex < 0
        ? amount > 0
          ? 0
          : weekNumbers.length - 1
        : currentIndex + amount;
    const nextWeekNumber = weekNumbers[nextIndex];
    if (nextWeekNumber !== undefined) setWeekNumber(nextWeekNumber);
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
          week={week}
          weekNumber={weekNumber}
          onWeekChange={handleWeekChange}
          isLoading={isFetching}
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
        />
      </div>
    </Layout>
  );
}
