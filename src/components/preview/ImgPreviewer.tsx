import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";

type ImgPreviewerProps = {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    title?: string;
};

export const ImgPreviewer = ({
    isOpen,
    imageSrc,
    onClose,
    title = "Image Preview",
}: ImgPreviewerProps) => {
    if (!isOpen) return null;

    const handleBackdropClick = () => {
        onClose();
    };

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                display: "flex",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 999999,
                backdropFilter: "blur(6px)",
                background: "rgba(60, 20, 80, 0.12)",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                onClick={handleContentClick}
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 24px rgba(80, 14, 88, 0.18)",
                    padding: "25px 24px",
                    maxWidth: "550px",
                    maxHeight: "95vh",
                    textAlign: "center",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "none",
                        border: "none",
                        fontSize: "1.8rem",
                        color: "var(--primary-color)",
                        cursor: "pointer",
                    }}
                >
                    &times;
                </button>
                <div
                    style={{
                        fontWeight: 600,
                        color: "var(--primary-color)",
                        fontSize: "1.1rem",
                        marginBottom: "15px",
                    }}
                >
                    {title}
                </div>
                <img
                    src={GetDrivePreviewUrlFromUrl(imageSrc) || imageSrc}
                    alt={title}
                    style={{
                        maxWidth: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(80, 14, 88, 0.08)",
                        marginBottom: "18px",
                    }}
                />
            </div>
        </div>
    );
};
