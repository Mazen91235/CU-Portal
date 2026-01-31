import {
    useState,
    useRef,
    useEffect,
    type Dispatch,
    type SetStateAction,
} from "react";
import styles from "./DateFilter.module.css";

type DateFilterProps = {
    setValue: Dispatch<SetStateAction<string>>;
    placeholder?: string;
};

export const DateFilter = ({
    setValue,
    placeholder = "Select Date",
}: DateFilterProps) => {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [displayDate, setDisplayDate] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDateSelect = (date: Date) => {
        const nextDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1,
        );
        const dateString = nextDay.toISOString().split("T")[0];
        setSelectedDate(dateString);
        setDisplayDate(
            date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        );
        setValue(dateString);
        setIsOpen(false);
    };

    const handleToday = () => {
        const today = new Date();
        handleDateSelect(today);
    };

    const handleReset = () => {
        setSelectedDate("");
        setDisplayDate("");
        setValue("");
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
        );
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const monthYear = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const calendarDays = generateCalendarDays();
    const today = new Date();
    const isToday = (day: number | null) =>
        day &&
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

    const isSelected = (day: number | null) => {
        if (!day || !selectedDate) return false;
        const [year, month, date] = selectedDate.split("-").map(Number);
        return (
            day === date &&
            currentMonth.getMonth() === month - 1 &&
            currentMonth.getFullYear() === year
        );
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                className={`${styles.dateFilter} ${isOpen ? styles.active : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg
                    className={styles.calendarIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <div
                    className={`${styles.dateDisplay} ${
                        !displayDate ? styles.placeholder : ""
                    }`}
                >
                    {displayDate || placeholder}
                </div>
            </button>

            {isOpen && (
                <div className={styles.calendarDropdown}>
                    <div className={styles.calendarHeader}>
                        <button
                            className={styles.calendarNav}
                            onClick={handlePrevMonth}
                            aria-label="Previous month"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div className={styles.calendarTitle}>{monthYear}</div>
                        <button
                            className={styles.calendarNav}
                            onClick={handleNextMonth}
                            aria-label="Next month"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.calendarGrid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div
                                    key={day}
                                    className={styles.calendarDayHeader}
                                >
                                    {day}
                                </div>
                            ),
                        )}
                        {calendarDays.map((day, index) => (
                            <button
                                key={index}
                                className={`${styles.calendarDay} ${
                                    day === null ? styles.otherMonth : ""
                                } ${isToday(day) ? styles.today : ""} ${
                                    isSelected(day) ? styles.selected : ""
                                }`}
                                onClick={() =>
                                    day &&
                                    handleDateSelect(
                                        new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth(),
                                            day,
                                        ),
                                    )
                                }
                                disabled={day === null}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className={styles.calendarActions}>
                        <button
                            className={styles.calendarBtn}
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                        <button
                            className={`${styles.calendarBtn} ${styles.primary}`}
                            onClick={handleToday}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
