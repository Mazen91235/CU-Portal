import type { ChangeEventHandler } from "react";
import styles from "./SelectFilter.module.css";

type SelectFilterProps = {
    value: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
    options: { value: string; label: string }[];
    placeholder?: string;
};

export const SelectFilter = ({
    value,
    onChange,
    options,
    placeholder,
}: SelectFilterProps) => {
    return (
        <select value={value} onChange={onChange} className={styles["select"]}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
