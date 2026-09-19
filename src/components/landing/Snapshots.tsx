import { useRef, useEffect } from "react";
import snapshot1 from "../../assets/snapshots/snapshot1.png";
import snapshot2 from "../../assets/snapshots/snapshot2.png";
import styles from "./Snapshots.module.css";

export const Snapshots = ({
    setSections,
}: {
    setSections: React.Dispatch<
        React.SetStateAction<React.RefObject<HTMLElement>[]>
    >;
}) => {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (ref.current)
            setSections((state) => [
                ...state,
                ref as React.RefObject<HTMLElement>,
            ]);
    }, [setSections]);
    return (
        <section ref={ref} className={styles.screenshotSection} id="snapshots">
            <div className={styles.screenshotsGalleryOverlap}>
                <img
                    src={snapshot1}
                    alt="CU-Portal Dashboard 1"
                    className={styles.screenshotImgBack}
                />
                <img
                    src={snapshot2}
                    alt="CU-Portal Dashboard 2"
                    className={styles.screenshotImgFront}
                />
            </div>
        </section>
    );
};
