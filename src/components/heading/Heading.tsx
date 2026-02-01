import type { HeadingProps } from "../../types/props/HeadingProps";
import styles from "./Heading.module.css";

export const Heading = ({ icon, content, size = "small" }: HeadingProps) => {
    const getIconClass = () => {
        const iconMap: Record<string, string> = {
            info: "fa-info-circle",
            "info-circle": "fa-info-circle",
            file: "fa-file-text",
            "file-text": "fa-file-text",
            calendar: "fa-calendar",
            clock: "fa-clock",
            list: "fa-list",
            check: "fa-check-circle",
            "check-circle": "fa-check-circle",
            book: "fa-book",
            edit: "fa-edit",
            user: "fa-user",
            users: "fa-users",
            cog: "fa-cog",
            settings: "fa-cog",
            tag: "fa-tag",
            tags: "fa-tags",
            location: "fa-map-marker-alt",
            "map-marker": "fa-map-marker-alt",
            graduation: "fa-graduation-cap",
            "graduation-cap": "fa-graduation-cap",
            building: "fa-building",
            globe: "fa-globe",
            envelope: "fa-envelope",
            phone: "fa-phone",
            link: "fa-link",
            image: "fa-image",
            video: "fa-video",
            play: "fa-play-circle",
            "play-circle": "fa-play-circle",
            download: "fa-download",
            upload: "fa-upload",
            search: "fa-search",
            filter: "fa-filter",
            star: "fa-star",
            heart: "fa-heart",
            comment: "fa-comment",
            bell: "fa-bell",
            chart: "fa-chart-bar",
            "chart-bar": "fa-chart-bar",
            table: "fa-table",
            clipboard: "fa-clipboard",
            folder: "fa-folder",
            "folder-open": "fa-folder-open",
            archive: "fa-archive",
            trash: "fa-trash",
            plus: "fa-plus-circle",
            "plus-circle": "fa-plus-circle",
            minus: "fa-minus-circle",
            "minus-circle": "fa-minus-circle",
            times: "fa-times-circle",
            "times-circle": "fa-times-circle",
            warning: "fa-exclamation-triangle",
            "exclamation-triangle": "fa-exclamation-triangle",
            question: "fa-question-circle",
            "question-circle": "fa-question-circle",
        };

        return iconMap[icon] || `fa-${icon}`;
    };

    const sizeClass =
        size === "large"
            ? styles.large
            : size == "medium"
              ? styles.medium
              : styles.small;

    return (
        <h4 className={`${styles.heading} ${sizeClass}`}>
            <i className={`fas ${getIconClass()}`}></i>
            {content}
        </h4>
    );
};
