import { useLoading } from "../../contexts/hooks/useLoading";

import { GetIcon } from "../../utils/LinkHandler";

import styles from "./Loading.module.css";

export const Loading = () => {
  const { loading } = useLoading();

  // Until Fixing Stuck Loading and All Loading Bugs
  //return null;
  console.log(loading);
  if (!loading) return null;
  console.log("loading");
  return (
    <div className={styles.loadingOverlayContainer}>
      <div className={styles.loadingOverlay}>
        <div className={styles.multiSpinner}>
          <img
            src={GetIcon("spinner-ellipse-16")}
            className={`${styles.spinnerLayer} ${styles.spinFast}`}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-11")}
            className={`${styles.spinnerLayer} ${styles.spinFast}`}
            style={{ width: "99%", height: "90%" }}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-14")}
            className={`${styles.spinnerLayer} ${styles.spinFast}`}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-15")}
            className={`${styles.spinnerLayer} ${styles.spinFast}`}
            style={{ width: "95%", height: "95%" }}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-13")}
            className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
            style={{ width: "98%", height: "98%" }}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-12")}
            className={`${styles.spinnerLayer} ${styles.reverseSpin}`}
            alt=""
          />
          <img
            src={GetIcon("spinner-ellipse-11")}
            className={`${styles.spinnerLayer} ${styles.spinFast}`}
            style={{ width: "101%", height: "101%" }}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};
