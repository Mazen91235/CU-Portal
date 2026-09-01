import { useState } from "react";
import styles from "./MonthPicker.module.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";

type MonthPickerProps = {
  onMonthChange?: (date: Date) => void;
};

export const MonthPicker = ({ onMonthChange }: MonthPickerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9));

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const changeMonth = (amount: number) => {
    const newDate = new Date(currentDate);

    newDate.setMonth(newDate.getMonth() + amount);

    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  return (
    <div className={styles.monthPicker}>
      <SlCalender className={styles.calendarIcon} size={17} />
      <span className={styles.monthText}>{monthYear}</span>

      <div className={styles.arrows}>
        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          <FaArrowUp size={13} />
        </button>

        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          <FaArrowDown size={13} />
        </button>
      </div>
    </div>
  );
};
