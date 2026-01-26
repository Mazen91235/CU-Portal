import type { FieldErrors, UseFormRegister, Path } from "react-hook-form";
import { InputError } from "./InputError";
import type React from "react";
import styles from "./Select.module.css";

export const Select = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    label,
    hasNoMarginOrBorder,
    children,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    label?: string;
    hasNoMarginOrBorder?: boolean;
    children: React.ReactNode;
}) => {
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
                {...register(name)}
                className={errors[name] ? styles["error"] : undefined}
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
