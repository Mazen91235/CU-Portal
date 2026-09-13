export type MaterialActionsDropdownProps = {
    onShare: () => void;
    onDownload?: () => void;
    onMove: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
    showAll?: boolean;
    showShare?: boolean;
    showDownload?: boolean;
    showMove?: boolean;
    showCopy?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
};
