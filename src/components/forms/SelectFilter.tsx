import {
    useState,
    useEffect,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import styles from "./SelectFilter.module.css";

type SelectFilterProps = {
    value?: string;
    setValue: Dispatch<SetStateAction<string>>;
    options: { value: string; label: string }[];
    placeholder?: string;
};

export const SelectFilter = ({
    value,
    setValue,
    options,
    placeholder,
}: SelectFilterProps) => {
    const [selectValue, setSelectValue] = useState("");

    useEffect(() => {
        if (value !== undefined) {
            setSelectValue(value);
        }
    }, [value]);

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectValue(e.target.value);
        setValue(e.target.value);
    };

    return (
        <select
            value={selectValue}
            onChange={onChange}
            className={styles["select"]}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
