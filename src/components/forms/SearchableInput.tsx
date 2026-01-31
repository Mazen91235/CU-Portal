import { useState, useRef, useEffect } from "react";
import type {
    FieldErrors,
    UseFormRegister,
    Path,
    UseFormSetValue,
    Control,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { InputError } from "./InputError";
import styles from "./SearchableInput.module.css";

type SearchableInputProps<T extends Record<string, unknown>> = {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
    disabled?: boolean;
};

export const SearchableInput = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    setValue,
    control,
    label,
    placeholder,
    options,
    defaultValue,
    disabled,
}: SearchableInputProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedValue, setSelectedValue] = useState(defaultValue || "");
    const [displayValue, setDisplayValue] = useState(
        options.find((opt) => opt.value === defaultValue)?.label || "",
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const formValue = useWatch({ control, name });

    useEffect(() => {
        if (formValue && formValue !== selectedValue) {
            setSelectedValue(formValue as string);
            const option = options.find((opt) => opt.value === formValue);
            setDisplayValue(option?.label || "");
        }
    }, [formValue, options, selectedValue]);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm("");
                setDisplayValue(
                    options.find((opt) => opt.value === selectedValue)?.label ||
                        "",
                );
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedValue, options]);

    const handleContainerClick = () => {
        if (!isOpen && !disabled) {
            setIsOpen(true);
            setSearchTerm(displayValue);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleOptionClick = (option: { value: string; label: string }) => {
        setSelectedValue(option.value);
        setDisplayValue(option.label);
        setSearchTerm("");
        setIsOpen(false);
        setValue(name, option.value as never, { shouldValidate: true });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={styles["input-group"]} ref={containerRef}>
            {label && (
                <label htmlFor={`form-${String(name)}-field`}>{label}</label>
            )}
            <div
                className={`${styles["searchable-container"]} ${isOpen ? styles["open"] : ""} ${errors[name] ? styles["error"] : ""} ${disabled ? styles["disabled"] : ""}`}
                onClick={handleContainerClick}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className={styles["visible-input"]}
                    value={isOpen ? searchTerm : displayValue}
                    onChange={handleInputChange}
                    readOnly={!isOpen}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <input
                    type="hidden"
                    {...register(name)}
                    value={selectedValue}
                />
                <div className={styles["arrow-icon"]} />
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <div className={styles["options-dropdown"]}>
                    {filteredOptions.map((option, i) => (
                        <div
                            key={i}
                            className={`${styles["option"]} ${selectedValue === option.value ? styles["selected"] : ""}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
            {isOpen && filteredOptions.length === 0 && (
                <div className={styles["options-dropdown"]}>
                    <div className={styles["no-options"]}>No options found</div>
                </div>
            )}
            {errors[name] && (
                <InputError>{errors[name]?.message as string}</InputError>
            )}
        </div>
    );
};
