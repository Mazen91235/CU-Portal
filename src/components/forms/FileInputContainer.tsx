import type { FieldErrors, UseFormRegister, Path } from "react-hook-form";
import styles from "./FileInputContainer.module.css";
import { Input } from "./Input";

export const FileInputContainer = <T extends Record<string, unknown>>({
    register,
    name,
    type,
    errors,
    ref,
    refCurrent,
    currentImg,
    onChange,
    disabled,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    type: string;
    errors: FieldErrors<T>;
    label?: string;
    ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
    refCurrent?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    currentImg: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    disabled?: boolean;
}) => {
    return (
        <section>
            <Input
                register={register}
                name={name}
                type={type}
                errors={errors}
                id={styles["avatar"]}
                ref={ref}
                onChange={onChange}
                disabled={disabled}
            />
            <span
                id={styles["avatar_container"]}
                className={disabled ? styles["disabled"] : ""}
                onClick={() => !disabled && refCurrent?.current?.click()}
            >
                <img src={currentImg} alt="" />
            </span>
        </section>
    );
};
