import { useEffect, useRef, useState } from "react";
import { Preview } from "./Preview";
import type { FileData, LinkData } from "../../types/dtos/TaskDtos";
import styles from "./AttachmentsAndLinksSection.module.css";
import { downloadFile } from "../../utils/FileDownloader";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { Heading } from "../heading/Heading";

type AttachmentsAndLinksSectionProps = {
    files?: FileData[];
    links?: LinkData[];
};

export const AttachmentsAndLinksSection = ({
    files,
    links,
}: AttachmentsAndLinksSectionProps) => {
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [fileToDownload, setFileToDownload] = useState<FileData | null>(null);
    const [shouldDownload, setShouldDownload] = useState(false);
    const downloadLink = useRef<HTMLAnchorElement>(null);

    const handlePreview = (file: FileData) => {
        setPreviewFile(file);
    };

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDownload = async (file_id: string) => {
        try {
            const url = await downloadFile(file_id);
            const fileToDownload = files?.find((file) => file.id == file_id);
            setFileToDownload({
                ...fileToDownload,
                url: url,
            });
            setShouldDownload(true);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    useEffect(() => {
        if (shouldDownload && downloadLink.current) {
            downloadLink.current.click();
            setShouldDownload(false);
        }
    }, [shouldDownload]);

    return (
        <>
            <div className={styles.section}>
                <Heading
                    icon="paperclip"
                    content="Attachments & Links"
                    size="large"
                />

                {files && files.length > 0 && (
                    <>
                        <Heading icon="file" content="Files:" size="medium" />
                        <div className={styles.filesList}>
                            {files.map((file) => (
                                <div key={file.id} className={styles.fileRow}>
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileIconBox}>
                                            <i className="fas fa-file"></i>
                                        </div>
                                        <div className={styles.fileDetails}>
                                            <div className={styles.fileName}>
                                                {file.name}
                                            </div>
                                            <div className={styles.fileSize}>
                                                {file.size}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.fileActions}>
                                        <button
                                            className={styles.previewButton}
                                            onClick={() => handlePreview(file)}
                                        >
                                            <i className="fas fa-eye"></i>
                                            Preview
                                        </button>
                                        <button
                                            className={styles.downloadButton}
                                            onClick={() =>
                                                handleDownload(file.id || "")
                                            }
                                        >
                                            <i className="fas fa-download"></i>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a
                            href={fileToDownload?.url}
                            className={styles.hiddenDownloadLink}
                            download={fileToDownload?.name || "download"}
                            ref={downloadLink}
                        />
                    </>
                )}

                {links && links.length > 0 && (
                    <>
                        <Heading icon="link" content="Links:" size="medium" />
                        <div className={styles.linksList}>
                            {links.map((link, index) => (
                                <div key={index} className={styles.linkRow}>
                                    <div className={styles.linkInfo}>
                                        <i className="fa fa-arrow-up-right-from-square"></i>
                                        <span>{link.title}</span>
                                    </div>
                                    <button
                                        className={styles.openLinkBtn}
                                        onClick={() =>
                                            window.open(link.url, "_blank")
                                        }
                                    >
                                        <i className="fas fa-external-link-alt"></i>
                                        Open
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {previewFile && (
                <Preview
                    file_id={previewFile.id || ""}
                    fileName={previewFile.name || "Unknown"}
                    onClose={handleClosePreview}
                    onDownload={() => handleDownload(previewFile.id || "")}
                />
            )}
        </>
    );
};
