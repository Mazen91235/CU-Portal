import { Link } from "react-router";

import styles from "./SubBanner.module.css";
import IconComponent from "../IconComponent";
import { type Icon } from "../../types/Icon";

type SubBannerProps = {
    title: string;
    description?: string;
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
                          backgroundImage: `url(${img})`,
                          height: "320px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          alignItems: "normal",
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
                        <h1 className={styles["title"]}>{title}</h1>
                        {description && (
                            <p className={styles["description"]}>
                                {description}
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
