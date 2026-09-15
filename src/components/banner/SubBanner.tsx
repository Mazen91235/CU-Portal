import { Link } from "react-router";
import type { ReactNode } from "react";

import IconComponent from "../IconComponent";
import { type Icon } from "../../types/Icon";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import styles from "./SubBanner.module.css";
import { formatString } from "../../utils/Formatter";

type SubBannerProps = {
    title: string | ReactNode;
    description?: string | ReactNode;
    button?: string;
    buttonAction?: () => void;
    deleteButton?: string;
    deleteAction?: () => void;
    icon?: Icon;
    linkText?: string;
    linkTo?: string;
    img?: string;
};

export const SubBanner = ({
    title,
    description,
    button,
    buttonAction,
    deleteButton = "Delete",
    deleteAction,
    icon,
    linkText,
    linkTo,
    img,
}: SubBannerProps) => {
    return (
        <header
            className={`${styles["subBanner"]} ${img ? styles["subBannerWithImage"] : ""}`}
            style={
                img
                    ? {
                          backgroundImage: `url(${GetDrivePreviewUrlFromUrl(img) || img})`,
                      }
                    : {}
            }
        >
            <div className={styles["leftSection"]}>
                {linkTo && linkText && (
                    <Link to={linkTo} className={styles["backLink"]}>
                        <i className="fas fa-arrow-left"></i>
                        {linkText}
                    </Link>
                )}
                <div className={styles["content"]}>
                    {icon && (
                        <IconComponent icon={icon} className={styles["icon"]} />
                    )}
                    <div className={styles["textContent"]}>
                        <h1 className={styles["title"]}>{typeof title === "string" ? formatString(title, "PageTitle") : title}</h1>
                        {description && (
                            <p className={styles["description"]}>
                                {typeof description === "string" ? formatString(description, "PageDescription") : description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {button && buttonAction && (
                <div
                    className={
                        deleteAction
                            ? styles["buttonGroup"]
                            : styles["buttonWrapper"]
                    }
                    style={img ? { alignItems: "end" } : {}}
                >
                    <button className={styles["button"]} onClick={buttonAction}>
                        {button}
                    </button>
                    {deleteAction && (
                        <button
                            className={styles["deleteButton"]}
                            onClick={deleteAction}
                        >
                            <i className="fa fa-times"></i>
                            {deleteButton}
                        </button>
                    )}
                </div>
            )}
        </header>
    );
};
