import styles from "./Banner.module.css";

type BannerProps = {
  title: string;
  description?: string;
  button?: string;
  buttonAction?: () => void;
  secondaryButton?: string;
  secondaryButtonAction?: () => void;
};

export const Banner = ({
  title,
  description,
  button,
  buttonAction,
  secondaryButton,
  secondaryButtonAction,
}: BannerProps) => {
  return (
    <section className={styles["banner"]}>
      <div className={styles["content"]}>
        <h1 className={styles["title"]}>{title}</h1>
        {description && <p className={styles["description"]}>{description}</p>}
      </div>
      <div className={styles.actions}>
        {secondaryButton && secondaryButtonAction && (
          <button className={styles["button"]} onClick={secondaryButtonAction}>
            {secondaryButton}
          </button>
        )}
        {button && buttonAction && (
          <button className={styles["button"]} onClick={buttonAction}>
            {button}
          </button>
        )}
      </div>
    </section>
  );
};
