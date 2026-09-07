import { useEffect, useRef } from "react";
import styles from "./Pagination.module.css";

export const Pagination = ({ onReached }: { onReached: () => void }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const delayRef = useRef<boolean>(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !delayRef.current) {
                        delayRef.current = true;
                        window.setTimeout(() => {
                            delayRef.current = false;
                        }, 1000);
                        onReached();
                    }
                });
            },
            {
                threshold: 0.5,
            },
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [onReached]);

    return <div ref={ref} className={styles.paginationTrigger} />;
};
