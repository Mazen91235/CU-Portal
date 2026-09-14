export type MaterialActionsDropdownProps = {
  onShare?: () => void;
  onDownload?: () => void;
  onMove: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  showAll?: boolean;
};
