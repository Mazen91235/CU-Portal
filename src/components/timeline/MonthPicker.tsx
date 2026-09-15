import { useState } from "react";
import styles from "./MonthPicker.module.css";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";

import { SlCalender } from "react-icons/sl";

type MonthPickerProps = {
  onMonthChange?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  onPeriodChange?: (date: Date, amount: number) => void;
  mode?: "month" | "week";
  weekNumber?: number;
  periodLabel?: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
};

export const formatWeekLabel = (
  weekNumber: number,
  startDate?: string | null,
) => {
  if (!startDate) return `Week ${weekNumber}`;

  const date = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return `Week ${weekNumber}`;

  const start = new Date(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const monthLabel =
    start.getMonth() === end.getMonth()
      ? start.toLocaleDateString("en-US", { month: "short" })
      : `${start.toLocaleDateString("en-US", { month: "short" })}-${end.toLocaleDateString("en-US", { month: "short" })}`;

  return `Week ${weekNumber} (${start.getDate()}-${end.getDate()} ${monthLabel} ${end.getFullYear()})`;
};

export const MonthPicker = ({
  onMonthChange,
  onDateChange,
  onPeriodChange,
  mode = "month",
  weekNumber,
  periodLabel,
  previousDisabled = false,
  nextDisabled = false,
}: MonthPickerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const label =
    mode === "week"
      ? periodLabel ||
        (weekNumber ? `Week ${weekNumber}` : "No weeks available")
      : currentDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

  const changeMonth = (amount: number) => {
    if (
      mode === "week" &&
      ((amount < 0 && previousDisabled) || (amount > 0 && nextDisabled))
    ) {
      return;
    }
    const newDate = new Date(currentDate);

    if (mode === "week") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + amount);
    }

    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    onDateChange?.(newDate);
    onPeriodChange?.(newDate, amount);
  };

  return (
    <div className={mode === "week" ? styles.weeklyGuide : styles.monthPicker}>
      <SlCalender className={styles.calendarIcon} size={17} />
      <span className={styles.monthText}>{label}</span>

      <div className={styles.arrows}>
        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(-1)}
          disabled={mode === "week" && previousDisabled}
          aria-label={mode === "week" ? "Previous week" : "Previous month"}
        >
          <SlArrowUp size={13} />
        </button>

        <button
          className={styles.arrowButton}
          onClick={() => changeMonth(1)}
          disabled={mode === "week" && nextDisabled}
          aria-label={mode === "week" ? "Next week" : "Next month"}
        >
          <SlArrowDown size={13} />
        </button>
      </div>
    </div>
  );
};
