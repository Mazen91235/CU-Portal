import { useState } from "react";
import { Day } from "./Day";

import styles from "./Calendar.module.css";
import type { CalendarDayEventsDto } from "../../types/dtos/CalendarDtos";

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const Calendar = ({
    eventsData,
    selectedDate,
    onDateSelect,
    onMonthChange,
    currentMonth,
    currentYear,
}: {
    eventsData: CalendarDayEventsDto;
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
    onMonthChange: (year: number, month: number) => void;
    currentMonth: number;
    currentYear: number;
}) => {
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const handlePrevMonth = () => {
        let newMonth = month;
        let newYear = year;

        if (month === 0) {
            newMonth = 11;
            newYear = year - 1;
        } else {
            newMonth = month - 1;
        }

        setMonth(newMonth);
        setYear(newYear);
        onMonthChange(newYear, newMonth);
    };

    const handleNextMonth = () => {
        let newMonth = month;
        let newYear = year;

        if (month === 11) {
            newMonth = 0;
            newYear = year + 1;
        } else {
            newMonth = month + 1;
        }

        setMonth(newMonth);
        setYear(newYear);
        onMonthChange(newYear, newMonth);
    };

    const renderCalendarGrid = () => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const rows = [];
        let day = 1;

        for (let i = 0; i < 6; i++) {
            const cells = [];

            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < startDay) || day > daysInMonth) {
                    cells.push(<td key={`empty-${i}-${j}`}></td>);
                } else {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const events = eventsData[dateStr] || {
                        tasks: [],
                        exams: [],
                        announcements: [],
                        events: [],
                        notes: [],
                    };
                    const isSelected = selectedDate === dateStr;

                    const toDayYear = new Date().getFullYear();
                    const toDayMonth = new Date().getMonth();
                    const toDayDate = new Date().getDate();
                    const toDay = `${toDayYear}-${String(toDayMonth + 1).padStart(2, "0")}-${String(toDayDate).padStart(2, "0")}`;

                    const isToDay = selectedDate !== toDay;

                    cells.push(
                        <td key={`day-${day}`}>
                            <Day
                                day={day}
                                dateStr={dateStr}
                                events={events}
                                isSelected={isSelected}
                                onSelect={onDateSelect}
                                isToday={isToDay && dateStr === toDay}
                            />
                        </td>,
                    );
                    day++;
                }
            }

            rows.push(
                <tr key={`row-${i}`} className={styles["calendar-row"]}>
                    {cells}
                </tr>,
            );

            if (day > daysInMonth) break;
        }

        return rows;
    };

    return (
        <div className={styles["calendar-wrapper"]}>
            <div className={styles["calendar-nav"]}>
                <button className={styles["nav-btn"]} onClick={handlePrevMonth}>
                    <i className="fa fa-chevron-left"></i>
                </button>
                <span className={styles["nav-label"]}>
                    {monthNames[month]} {year}
                </span>
                <button className={styles["nav-btn"]} onClick={handleNextMonth}>
                    <i className="fa fa-chevron-right"></i>
                </button>
            </div>

            <div className={styles["calendar-table-outer"]}>
                <table className={styles["calendar-table"]}>
                    <thead>
                        <tr>
                            <th>Sun</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                            <th>Sat</th>
                        </tr>
                    </thead>
                    <tbody>{renderCalendarGrid()}</tbody>
                </table>
            </div>

            <div className={styles["legend"]}>
                <span>
                    <span
                        className={`${styles["legend-dot"]} ${styles["dot-exam"]}`}
                    ></span>{" "}
                    Exams
                </span>
                <span>
                    <span
                        className={`${styles["legend-dot"]} ${styles["dot-assignment"]}`}
                    ></span>{" "}
                    Assignments
                </span>
                <span>
                    <span
                        className={`${styles["legend-dot"]} ${styles["dot-announcement"]}`}
                    ></span>{" "}
                    Announcements
                </span>
                <span>
                    <span
                        className={`${styles["legend-dot"]} ${styles["dot-event"]}`}
                    ></span>{" "}
                    Events
                </span>
            </div>
        </div>
    );
};
