import styles from "./Banner.module.css";

type BannerProps = {
    title: string;
    description?: string;
    button: string;
    buttonAction: () => void;
};

export const Banner = ({
    title,
    description,
    button,
    buttonAction,
}: BannerProps) => {
    return (
        <section className={styles["banner"]}>
            <div className={styles["content"]}>
                <h1 className={styles["title"]}>{title}</h1>
                {description && (
                    <p className={styles["description"]}>{description}</p>
                )}
            </div>
            <button className={styles["button"]} onClick={buttonAction}>
                {button}
            </button>
        </section>
    );
};
