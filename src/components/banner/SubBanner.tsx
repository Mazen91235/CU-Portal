import { Link } from "react-router";

import styles from "./SubBanner.module.css";
import type { IconType } from "react-icons/lib";

type SubBannerProps = {
  title: string;
  description?: string;
  button?: string;
  buttonAction?: () => void;
  deleteButton?: string;
  deleteAction?: () => void;
  icon?: IconType;
  linkText?: string;
  linkTo?: string;
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
}: SubBannerProps) => {
    const IconComponent = icon ? icon : null;
  return (
    <header className={styles["subBanner"]}>
      <div className={styles["leftSection"]}>
        {linkTo && linkText && (
          <Link to={linkTo} className={styles["backLink"]}>
            <i className="fas fa-arrow-left"></i>
            {linkText}
          </Link>
        )}
        <div className={styles["content"]}>
          {IconComponent && <IconComponent className={styles["icon"]} />}
          <div className={styles["textContent"]}>
            <h1 className={styles["title"]}>{title}</h1>
            {description && (
              <p className={styles["description"]}>{description}</p>
            )}
          </div>
        </div>
      </div>
      {button && buttonAction && (
        <div
          className={
            deleteAction ? styles["buttonGroup"] : styles["buttonWrapper"]
          }
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
