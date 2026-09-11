import {
    forwardRef,
    type ChangeEventHandler,
    type ForwardedRef,
    type ReactElement,
    type Ref,
    type RefObject,
} from "react";
import type { FieldErrors, UseFormRegister, Path } from "react-hook-form";
import { InputError } from "./InputError";
import styles from "./Input.module.css";

type InputProps<T extends Record<string, unknown>> = {
    register: UseFormRegister<T>;
    name: Path<T>;
    type: string;
    placeholder?: string;
    errors: FieldErrors<T>;
    label?: string;
    value?: string | number | readonly string[] | undefined;
    id?: string;
    onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    registerOptions?: Parameters<UseFormRegister<T>>[1];
    disabled?: boolean;
    isTextArea?: boolean;
    hasNoMarginOrBorder?: boolean;
    className?: string;
    maxLength?: number;
};

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
    return (value: T | null) => {
        refs.forEach((r) => {
            if (!r) return;
            if (typeof r === "function") {
                r(value);
            } else if (typeof r === "object" && r !== null && "current" in r) {
                (r as RefObject<T | null>).current = value;
            }
        });
    };
}

const InputInner = <T extends Record<string, unknown>>(
    {
        register,
        name,
        type,
        placeholder,
        errors,
        label,
        value,
        id,
        onChange,
        registerOptions,
        disabled,
        isTextArea,
        hasNoMarginOrBorder,
        className,
        maxLength,
    }: InputProps<T>,
    forwardedRef: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>,
) => {
    const registration = register(name, registerOptions);

    const handleChange: ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement
    > = (e) => {
        void registration.onChange(e);
        onChange?.(e);
    };

    return (
        <div
            className={`${styles["input-group"]} ${className ?? ""}`}
            style={
                hasNoMarginOrBorder
                    ? {
                          margin: 0,
                      }
                    : undefined
            }
        >
            {label && (
                <label htmlFor={id ?? `form-${String(name)}-field`}>
                    {label}
                </label>
            )}
            {!isTextArea ? (
                <input
                    id={id ?? `form-${String(name)}-field`}
                    type={type}
                    placeholder={placeholder}
                    name={registration.name}
                    onBlur={registration.onBlur}
                    ref={mergeRefs(registration.ref, forwardedRef)}
                    value={value}
                    className={errors[name] ? styles["error"] : undefined}
                    onChange={handleChange}
                    disabled={disabled}
                    maxLength={maxLength}
                    style={hasNoMarginOrBorder ? { border: "none" } : undefined}
                />
            ) : (
                <textarea
                    id={id ?? `form-${String(name)}-field`}
                    placeholder={placeholder}
                    name={registration.name}
                    onBlur={registration.onBlur}
                    ref={mergeRefs(registration.ref, forwardedRef)}
                    value={value}
                    className={errors[name] ? styles["error"] : undefined}
                    onChange={handleChange}
                    disabled={disabled}
                    maxLength={maxLength}
                    rows={8}
                    style={hasNoMarginOrBorder ? { border: "none" } : undefined}
                />
            )}
            {errors[name] && type != "file" && (
                <InputError>{errors[name]?.message as string}</InputError>
            )}
        </div>
    );
};

export const Input = forwardRef(InputInner) as <
    T extends Record<string, unknown>,
>(
    props: InputProps<T> & {
        ref?: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>;
    },
) => ReactElement;
