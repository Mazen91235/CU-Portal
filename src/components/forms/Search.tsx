import type { ChangeEventHandler } from "react";
import styles from "./Search.module.css";

export const Search = ({
    placeholder,
    value,
    onChange,
}: {
    placeholder?: string;
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}) => {
    return (
        <div className={styles["search-container"]}>
            <input
                type="text"
                className={styles["search-input"]}
                placeholder={placeholder || "Search..."}
                value={value}
                onChange={onChange}
            />
            <svg
                className={styles["search-icon"]}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M19 19L14.65 14.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};
