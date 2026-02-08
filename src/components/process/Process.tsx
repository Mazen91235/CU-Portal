import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../services/redux/Hooks";
import styles from "./Process.module.css";
import { formatString } from "../../utils/Formatter";

export function Process() {
    const processes = useAppSelector((state) => state.process.processes);
    const [isOpen, setIsOpen] = useState(false);

    const inProgressProcesses = useMemo(
        () =>
            processes.filter(
                (process) =>
                    process.status === "processing" ||
                    process.status === "pending",
            ),
        [processes],
    );

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (inProgressProcesses.length > 0) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [inProgressProcesses.length]);

    if (processes.length === 0) {
        return null;
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`${styles.processContainer} ${isOpen ? styles.open : ""}`}
        >
            <div className={styles.header} onClick={toggleOpen}>
                <span>
                    {inProgressProcesses.length} Process
                    {inProgressProcesses.length !== 1 ? "es" : ""} in Progress
                </span>
                <i className={`fa-solid fa-angle-up ${styles.icon}`}></i>
            </div>
            <div className={styles.content}>
                {processes.map((process) => {
                    return (
                        <div
                            key={process.id}
                            className={`${styles.processItem} ${styles[process.status]}`}
                        >
                            <span className={styles.processName}>
                                {formatString(process.name, 15)}
                            </span>
                            <div className={styles.circularProgress}>
                                <svg
                                    className={styles.progressCircle}
                                    width="60"
                                    height="60"
                                    viewBox="0 0 60 60"
                                >
                                    <circle
                                        className={styles.progressBg}
                                        cx="30"
                                        cy="30"
                                        r="28"
                                    ></circle>
                                    <circle
                                        className={styles.progressBar}
                                        cx="30"
                                        cy="30"
                                        r="28"
                                        style={{
                                            strokeDashoffset:
                                                188.4 *
                                                (1 -
                                                    (process.progress || 0) /
                                                        100),
                                        }}
                                    ></circle>
                                </svg>
                                <div className={styles.spinnerBorder}></div>
                                <div className={styles.done}>
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <div className={styles.failed}>
                                    <i className="fa-solid fa-times"></i>
                                </div>
                                <span className={styles.progressText}>
                                    {Math.round(process.progress || 0)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
