import { useRef } from "react";
import type { UseFormRegister, Path } from "react-hook-form";
import styles from "./LogoInputContainer.module.css";

export const LogoInputContainer = <T extends Record<string, unknown>>({
  register,
  name,
  currentLogo,
  onChange,
  disabled,
}: {
  register: UseFormRegister<T>;
  name: Path<T>;
  currentLogo: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    name: registeredName,
    onBlur,
    onChange: registerOnChange,
  } = register(name);

  return (
    <div className={styles["logo-container"]}>
      <div
        className={`${styles["upload-area"]} ${disabled ? styles["disabled"] : ""}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles["file-input"]}
          name={registeredName}
          onBlur={onBlur}
          onChange={(e) => {
            registerOnChange?.(e);
            onChange?.(e);
          }}
          disabled={disabled}
        />

        <div className={styles["content"]}>
          <div className={styles["logo-preview"]}>
            {currentLogo ? (
              <img src={currentLogo} alt="Logo preview" />
            ) : (
              <div className={styles["placeholder-circle"]} />
            )}
          </div>
          <p className={styles["upload-text"]}>Upload or replace logo</p>
          <button
            type="button"
            className={styles["choose-button"]}
            onClick={(e) => {
              e.preventDefault();
              if (!disabled) {
                fileInputRef.current?.click();
              }
            }}
          >
            Choose Files
          </button>
        </div>
      </div>
    </div>
  );
};
