import type { FieldErrors, UseFormRegister, Path } from "react-hook-form";
import type { ChangeEventHandler } from "react";
import { InputError } from "./InputError";
import type React from "react";
import styles from "./Select.module.css";

export const Select = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    label,
    disabled,
    hasNoMarginOrBorder,
    onChange,
    children,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    label?: string;
    disabled?: boolean;
    hasNoMarginOrBorder?: boolean;
    onChange?: ChangeEventHandler<HTMLSelectElement>;
    children: React.ReactNode;
}) => {
    const registration = register(name);

    const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        void registration.onChange(e);
        onChange?.(e);
    };

    return (
        <div
            className={styles["input-group"]}
            style={hasNoMarginOrBorder ? { margin: 0 } : undefined}
        >
            {label && (
                <label htmlFor={`form-${String(name)}-field`}>{label}</label>
            )}
            <select
                id={`form-${String(name)}-field`}
                name={registration.name}
                onBlur={registration.onBlur}
                ref={registration.ref}
                onChange={handleChange}
                className={errors[name] ? styles["error"] : undefined}
                disabled={disabled}
                style={hasNoMarginOrBorder ? { border: "none" } : undefined}
            >
                {children}
            </select>
            {errors[name] && (
                <InputError>{errors[name]?.message as string}</InputError>
            )}
        </div>
    );
};
