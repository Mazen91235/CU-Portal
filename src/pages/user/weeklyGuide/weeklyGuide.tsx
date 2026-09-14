import { useState } from "react";
import styles from "./weekltGuide.module.css";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { PageSeo } from "../../../components/PageSeo";
import { Preview } from "../../../components/preview/Preview";
import { downloadFile } from "../../../utils/FileDownloader";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { getFileIcon } from "../../../utils/MaterialHelpers";
import { FaChevronUp } from "react-icons/fa";
import { MonthPicker } from "../../../components/timeline/MonthPicker";
import { MaterialActionsDropdown } from "../../../components/materials/MaterialActionsDropdown";

/* ---------- Types ---------- */

interface FileItem {
  id: number;
  name: string;
  type: string;
  daysAgo: number;
}

interface Section {
  id: string;
  title: string;
  items: FileItem[];
  defaultOpen?: boolean;
}

interface WeekScheduleProps {
  sections: Section[];
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    defaultOpen: true,
    items: [{ id: 1, name: "Lecture 2 .Pdf", type: "pdf", daysAgo: 2 }],
  },
  {
    id: "chemistry",
    title: "Chemistry",
    defaultOpen: true,
    items: [
      { id: 2, name: "Lecture 1 .Ppt", type: "ppt", daysAgo: 2 },
      { id: 3, name: "Image", type: "image", daysAgo: 3 },
      { id: 4, name: "Video", type: "video", daysAgo: 3 },
      { id: 5, name: "Audio", type: "audio", daysAgo: 3 },
    ],
  },
  {
    id: "physics",
    title: "Physics",
    defaultOpen: true,
    items: [{ id: 6, name: "Lecture 2 .Mp3", type: "txt", daysAgo: 2 }],
  },
  {
    id: "communications",
    title: "Communications Engineering",
    defaultOpen: true,
    items: [
      { id: 7, name: "Lecture 1 .Ppt", type: "ppt", daysAgo: 2 },
      { id: 8, name: "Lecture 2 .Mp3", type: "txt", daysAgo: 3 },
    ],
  },
  {
    id: "mathematics-2",
    title: "Mathematics",
    defaultOpen: false,
    items: [{ id: 9, name: "Lecture 2 .Pdf", type: "pdf", daysAgo: 2 }],
  },
  {
    id: "chemistry-2",
    title: "Chemistry",
    defaultOpen: false,
    items: [],
  },
  {
    id: "communications-2",
    title: "Communications Engineering",
    defaultOpen: false,
    items: [],
  },
];

function WeeklyMaterialCard({ item }: { item: FileItem }) {
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handlePreview = () => {
    if (item.type !== "folder") {
      setPreviewFile({ id: String(item.id), name: item.name });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(String(item.id));
    } catch (error) {
      handlePopupErrors(error);
    }
  };

  return (
    <>
      <article className={styles.fileCard}>
        <div className={styles.fileInfo}>
          <img
            src={getFileIcon(item.type)}
            alt=""
            className={styles.fileIcon}
          />
          <div className={styles.fileText}>
            <span className={styles.fileName}>{item.name}</span>
            <span className={styles.fileMeta}>{item.daysAgo} days ago</span>
          </div>
        </div>

        {item.type !== "folder" && (
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

        {item.type !== "folder" && (
          <div className={styles.fileActionsMobile}>
            <MaterialActionsDropdown
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

function AccordionSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(Boolean(section.defaultOpen));
  const count = section.items.length;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.sectionTitle}>
          {section.title}
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
          {section.items.map((item) => (
            <WeeklyMaterialCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function UserWeeklyGuide({ sections }: WeekScheduleProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.weekPicker}>
        <MonthPicker mode="week" />
      </div>
      <div className={styles.sectionsList}>
        {sections.map((section) => (
          <AccordionSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

export function WeeklyGuidePage() {
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
        <UserWeeklyGuide sections={DEFAULT_SECTIONS} />
      </div>
    </Layout>
  );
}
