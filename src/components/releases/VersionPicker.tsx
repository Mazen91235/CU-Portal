import { useEffect, useState } from "react";
import { SlArrowDown, SlArrowUp, SlTag } from "react-icons/sl";
import styles from "./VersionPicker.module.css";

type VersionPickerProps = {
  versions: { value: string; label: string }[];
  value?: string;
  onVersionChange: (version: string) => void;
};

export const VersionPicker = ({
  versions,
  value,
  onVersionChange,
}: VersionPickerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const nextIndex = value
      ? Math.max(
          versions.findIndex((version) => version.value === value),
          0,
        )
      : 0;
    setSelectedIndex(nextIndex);
  }, [value, versions]);

  useEffect(() => {
    if (versions[0] && !value) {
      onVersionChange(versions[0].value);
    }
  }, [onVersionChange, value, versions]);

  const changeVersion = (amount: number) => {
    if (!versions.length) return;

    const nextIndex = Math.min(
      Math.max(selectedIndex + amount, 0),
      versions.length - 1,
    );
    setSelectedIndex(nextIndex);
    onVersionChange(versions[nextIndex].value);
  };

  return (
    <div className={styles.versionPicker}>
      <SlTag className={styles.versionIcon} size={20} />
      <span className={styles.versionText}>
        {versions[selectedIndex]?.label ?? "Versions"}
      </span>
      <div className={styles.arrows}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => changeVersion(-1)}
          disabled={selectedIndex === 0}
          aria-label="Previous version"
        >
          <SlArrowUp size={13} />
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => changeVersion(1)}
          disabled={selectedIndex === versions.length - 1}
          aria-label="Next version"
        >
          <SlArrowDown size={13} />
        </button>
      </div>
    </div>
  );
};
