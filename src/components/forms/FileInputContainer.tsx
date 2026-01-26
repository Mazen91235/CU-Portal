import type { FieldErrors, UseFormRegister, Path } from "react-hook-form";
import { Input } from "./Input";

export const FileInputContainer = <T extends Record<string, unknown>>({
    register,
    name,
    type,
    errors,
    styles,
    ref,
    refCurrent,
    currentImg,
    onChange,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    type: string;
    errors: FieldErrors<T>;
    label?: string;
    styles: Record<string, string>;
    ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
    refCurrent?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    currentImg: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
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
            />
            <span
                id={styles["avatar_container"]}
                onClick={() => refCurrent?.current?.click()}
            >
                <img src={currentImg} alt="" />
            </span>
        </section>
    );
};
