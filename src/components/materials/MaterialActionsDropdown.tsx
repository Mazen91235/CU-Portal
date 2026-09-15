import { useEffect, useRef, useState } from "react";
import type { MaterialActionsDropdownProps } from "./types";
import IconComponent from "../IconComponent";
import styles from "./MaterialActionsDropdown.module.css";

export const MaterialActionsDropdown = ({
  onShare,
  onDownload,
  onMove,
  onCopy,
  onEdit,
  onDelete,
  onView,
  showAll,
  showShare = true,
  showDownload = true,
  showCopy = showAll ?? false,
  showMove = showAll ?? false,
  showEdit = showAll ?? false,
  showDelete = showAll ?? false,
}: MaterialActionsDropdownProps) => {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShow((value) => !value);
  };

  const handleAction = (action?: () => void) => {
    action?.();
    setShow(false);
  };

  return (
    <div
      className={styles.dropdown}
      onMouseDown={(e) => e.stopPropagation()}
      ref={dropdownRef}
    >
      <button
        className={`${styles.dropbtn} ${show ? styles.show : ""}`}
        type="button"
        onClick={handleToggle}
        aria-label="Material actions"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      <div className={`${styles.dropdownMenu} ${show ? styles.show : ""}`}>
        {showShare && onShare && (
          <a
            href="#!"
            title="Share"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onShare);
            }}
          >
            <IconComponent icon="share" />
          </a>
        )}

        {showDownload && onDownload && (
          <a
            href="#!"
            title="Download"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onDownload);
            }}
          >
            <IconComponent icon="download" />
          </a>
        )}

        {onView && (
          <a
            href="#!"
            title="View"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onView);
            }}
          >
            <IconComponent icon="eye-review" />
          </a>
        )}

        {showMove && onMove && (
          <a
            href="#!"
            title="Move"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onMove);
            }}
          >
            <IconComponent icon="move" />
          </a>
        )}

        {showCopy && onCopy && (
          <a
            href="#!"
            title="Copy"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onCopy);
            }}
          >
            <IconComponent icon="copy" />
          </a>
        )}

        {showEdit && onEdit && (
          <a
            href="#!"
            title="Edit"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onEdit);
            }}
          >
            <IconComponent icon="edit" />
          </a>
        )}

        {showDelete && onDelete && (
          <a
            href="#!"
            title="Delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(onDelete);
            }}
          >
            <IconComponent icon="delete" />
          </a>
        )}
      </div>
    </div>
  );
};
