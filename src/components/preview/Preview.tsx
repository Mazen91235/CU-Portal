import type { PreviewProps } from "../../types/props/PreviewProps";
import downloadIcon from "../../assets/icons/download-icon.svg";
import styles from "./Preview.module.css";
import { formatString } from "../../utils/Formatter";

export const Preview = ({
    file_id,
    fileName,
    onClose,
    onDownload,
}: PreviewProps) => {
    return (
        <div className={styles.previewer}>
            <div className={styles.previewerHeader}>
                <div>
                    <button
                        className={styles.closePreviewerBtn}
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <h2 className={styles.previewerTitle}>
                        {formatString(fileName, 25)}
                    </h2>
                </div>
                <button className={styles.fileActionBtn} onClick={onDownload}>
                    <img src={downloadIcon} alt="Download" />
                </button>
            </div>
            <div className={styles.previewerContent}>
                <iframe
                    className={styles.filePreviewFrame}
                    src={`https://drive.google.com/file/d/${file_id}/preview`}
                    title={fileName}
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};
