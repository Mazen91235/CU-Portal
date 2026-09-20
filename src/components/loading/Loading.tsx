import { useLoading } from "../../contexts/hooks/useLoading";

import IconComponent from "../IconComponent";

import styles from "./Loading.module.css";

export const Loading = () => {
    const { loading } = useLoading();

    if (!loading) return null;

    return (
        <div className={styles.loadingOverlayContainer}>
            <div className={styles.loadingOverlay}>
                <div className={styles.multiSpinner}>
                    <IconComponent
                        icon="spinner-ellipse-16"
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                    />
                    <IconComponent
                        icon="spinner-ellipse-11"
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "99%", height: "90%" }}
                    />
                    <IconComponent
                        icon="spinner-ellipse-14"
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                    />
                    <IconComponent
                        icon="spinner-ellipse-15"
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "95%", height: "95%" }}
                    />
                    <IconComponent
                        icon="spinner-ellipse-13"
                        className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
                        style={{ width: "98%", height: "98%" }}
                    />
                    <IconComponent
                        icon="spinner-ellipse-12"
                        className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
                    />
                    <IconComponent
                        icon="spinner-ellipse-11"
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "101%", height: "101%" }}
                    />
                </div>
            </div>
        </div>
    );
};
