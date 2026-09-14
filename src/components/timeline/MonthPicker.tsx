import { useState } from "react";
import styles from "./MonthPicker.module.css";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";

import { SlCalender } from "react-icons/sl";

type MonthPickerProps = {
  onMonthChange?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  mode?: "month" | "week";
};

const getWeekLabel = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const monthLabel =
    start.getMonth() === end.getMonth()
      ? start.toLocaleDateString("en-US", { month: "short" })
      : `${start.toLocaleDateString("en-US", { month: "short" })}-${end.toLocaleDateString("en-US", { month: "short" })}`;

  return `Week ${Math.floor((start.getDate() - 1) / 7) + 1} (${start.getDate()}-${end.getDate()} ${monthLabel} ${end.getFullYear()})`;
};

export const MonthPicker = ({
  onMonthChange,
  onDateChange,
  mode = "month",
}: MonthPickerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const label =
    mode === "week"
      ? getWeekLabel(currentDate)
      : currentDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

  const changeMonth = (amount: number) => {
    const newDate = new Date(currentDate);

    if (mode === "week") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + amount);
    }

    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    onDateChange?.(newDate);
  };

  return (
    <div className={mode === "week" ? styles.weeklyGuide : styles.monthPicker}>
      <SlCalender className={styles.calendarIcon} size={17} />
      <span className={styles.monthText}>{label}</span>

      <div className={styles.arrows}>
        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(-1)}
          aria-label={mode === "week" ? "Previous week" : "Previous month"}
        >
          <SlArrowUp size={13} />
        </button>

        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(1)}
          aria-label={mode === "week" ? "Next week" : "Next month"}
        >
          <SlArrowDown size={13} />
        </button>
      </div>
    </div>
  );
};
