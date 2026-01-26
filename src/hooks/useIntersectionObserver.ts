import { useEffect } from "react";

export const useIntersectionObserver = (
    sections: React.RefObject<HTMLElement>[],
    callback: (entry: IntersectionObserverEntry) => void,
) => {
    useEffect(() => {
        const observe = () => {
            if (document.readyState != "complete") return;
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            callback(entry);
                        }
                    });
                },
                { threshold: 0.5 },
            );
            sections.forEach((section) => {
                if (section.current) {
                    observer.observe(section.current);
                }
            });
            return () => {
                observer.disconnect();
            };
        };
        document.addEventListener("readystatechange", observe);
        return () => {
            document.removeEventListener("readystatechange", observe);
        };
    }, [sections, callback]);
};
