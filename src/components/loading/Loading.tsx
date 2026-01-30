import { useLoading } from "../../contexts/hooks/useLoading";

import spinnerEllipse11 from "../../assets/icons/spinner-ellipse-11.svg";
import spinnerEllipse12 from "../../assets/icons/spinner-ellipse-12.svg";
import spinnerEllipse13 from "../../assets/icons/spinner-ellipse-13.svg";
import spinnerEllipse14 from "../../assets/icons/spinner-ellipse-14.svg";
import spinnerEllipse15 from "../../assets/icons/spinner-ellipse-15.svg";
import spinnerEllipse16 from "../../assets/icons/spinner-ellipse-16.svg";

import styles from "./Loading.module.css";

export const Loading = () => {
    const { loading } = useLoading();

    if (!loading) return null;

    return (
        <div className={styles.loadingOverlayContainer}>
            <div className={styles.loadingOverlay}>
                <div className={styles.multiSpinner}>
                    <img
                        src={spinnerEllipse16}
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse11}
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "99%", height: "90%" }}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse14}
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse15}
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "95%", height: "95%" }}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse13}
                        className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
                        style={{ width: "98%", height: "98%" }}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse12}
                        className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
                        alt=""
                    />
                    <img
                        src={spinnerEllipse11}
                        className={`${styles.spinnerLayer} ${styles.spinFast}`}
                        style={{ width: "101%", height: "101%" }}
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
};
