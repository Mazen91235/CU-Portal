import { useState } from "react";
import styles from "./MonthPicker.module.css";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";

import { SlCalender } from "react-icons/sl";

type MonthPickerProps = {
  onMonthChange?: (date: Date) => void;
};

export const MonthPicker = ({ onMonthChange }: MonthPickerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
          <SlArrowUp size={13} />
        </button>

        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          <SlArrowDown size={13} />
        </button>
      </div>
    </div>
  );
};
