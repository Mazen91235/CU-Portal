import snapshot1 from "../../assets/snapshots/dashboard-view-2.png";
import snapshot2 from "../../assets/snapshots/dashboard-view-1.png";
import styles from "./Snapshots.module.css";

export const Snapshots = () => {
    return (
        <section className={styles.screenshotSection} id="Snapshots">
            <div className={styles.screenshotsGalleryOverlap}>
                <img
                    src={snapshot1}
                    alt="Student Portal Dashboard 1"
                    className={styles.screenshotImgBack}
                />
                <img
                    src={snapshot2}
                    alt="Student Portal Dashboard 2"
                    className={styles.screenshotImgFront}
                />
            </div>
        </section>
    );
};
