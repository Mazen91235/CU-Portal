import { useState, useRef, useEffect } from "react";
import type {
    Control,
    FieldErrors,
    Path,
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { InputError } from "./InputError";
import styles from "./DateFilter.module.css";
import {
    formatCalendarDay,
    formatDateWithWeekday,
} from "../../utils/Formatter";

type DateInputProps<T extends Record<string, unknown>> = {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    startRight?: boolean;
};

export const DateInput = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    setValue,
    control,
    label,
    placeholder = "Select Date",
    disabled,
    startRight = false,
}: DateInputProps<T>) => {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [displayDate, setDisplayDate] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{
        left: number;
        top: number;
    } | null>(null);
    const VIEWPORT_MARGIN = 16;
    const DROPDOWN_WIDTH = 280;
    const formValue = useWatch({ control, name });

    useEffect(() => {
        const value = formValue as string | undefined;
        if (!value) {
            setSelectedDate("");
            setDisplayDate("");
            return;
        }

        const [datePart] = value.split("T");
        const selected = new Date(`${datePart}T00:00:00`);
        setSelectedDate(formatCalendarDay(selected));
        setDisplayDate(formatDateWithWeekday(value));
        setCurrentMonth(selected);
    }, [formValue]);

    const updateDropdownPosition = () => {
        const trigger = containerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const maxLeft = Math.max(
            VIEWPORT_MARGIN,
            window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN,
        );
        setDropdownPosition({
            left: Math.min(Math.max(rect.left, VIEWPORT_MARGIN), maxLeft),
            top: rect.bottom + 8,
        });
    };

    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen((open) => {
            const next = !open;
            if (next) {
                requestAnimationFrame(updateDropdownPosition);
            }
            return next;
        });
    };

    const handleDateSelect = (date: Date) => {
        const dateString = formatCalendarDay(date);
        setSelectedDate(dateString);
        setDisplayDate(formatDateWithWeekday(dateString));
        setValue(name, dateString as never, { shouldValidate: true });
        setIsOpen(false);
    };

    const handleToday = () => {
        const today = new Date();
        handleDateSelect(today);
    };

    const handleReset = () => {
        setSelectedDate("");
        setDisplayDate("");
        setValue(name, "" as never, { shouldValidate: true });
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
        const handleViewportChange = () => {
            if (isOpen) updateDropdownPosition();
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) updateDropdownPosition();
    }, [isOpen]);

    return (
        <div className={styles.container} ref={containerRef}>
            {label && (
                <label htmlFor={`form-${String(name)}-field`}>{label}</label>
            )}
            <button
                type="button"
                className={`${styles.dateFilter} ${isOpen ? styles.active : ""}`}
                onClick={toggleDropdown}
                disabled={disabled}
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
                    className={`${styles.dateDisplay} ${!displayDate ? styles.placeholder : ""}`}
                >
                    {displayDate || placeholder}
                </div>
            </button>
            <input type="hidden" {...register(name)} value={selectedDate} />

            {isOpen && (
                <div
                    className={`${styles.calendarDropdown} ${startRight ? styles.startRight : ""}`}
                    style={dropdownPosition ? { left: dropdownPosition.left, top: dropdownPosition.top } : undefined}
                >
                    <div className={styles.calendarHeader}>
                        <button
                            type="button"
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
                            type="button"
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
                                type="button"
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
                            type="button"
                            className={styles.calendarBtn}
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className={`${styles.calendarBtn} ${styles.primary}`}
                            onClick={handleToday}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
            {errors[name] && (
                <InputError>{errors[name]?.message as string}</InputError>
            )}
        </div>
    );
};