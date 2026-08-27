import { useState, useCallback, useEffect } from "react";
import { useLazyGetCalendarTasksQuery } from "../../../services/apis/user/CalendarAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Layout } from "../../../components/layout/Layout";
import { Calendar } from "../../../components/calendar/Calendar";
import { DayEvent } from "../../../components/calendar/DayEvent";
import { EmptySection } from "../../../components/calendar/EmptySection";
import type { CalendarDayEventsDto } from "../../../types/dtos/CalendarDtos";

import styles from "./CalendarPage.module.css";

export const CalendarPage = () => {
    const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [getCalendar] = useLazyGetCalendarTasksQuery();

    const fetchCalendar = useCallback(
        async (year: number, month: number) => {
            try {
                const result = await getCalendar({
                    date_from: `${year}-${String(month + 1).padStart(2, "0")}-01`,
                    date_to: `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`,
                }).unwrap();

                setEventsData(result.data?.events || {});
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [getCalendar],
    );

    const authQueryParams = useCallback(
        () => fetchCalendar(currentYear, currentMonth),
        [fetchCalendar, currentYear, currentMonth],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        const today = new Date();
        if (
            today.getFullYear() === currentYear &&
            today.getMonth() === currentMonth
        ) {
            const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            setSelectedDate(todayStr);
        } else {
            setSelectedDate(null);
        }
    }, [currentYear, currentMonth]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleMonthChange = async (year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
    };

    const selectedEvents: CalendarDayEventsDto[string] = selectedDate
        ? eventsData[selectedDate] || {
              tasks: [],
              exams: [],
              announcements: [],
          }
        : { tasks: [], exams: [], announcements: [] };

    const renderDetailsSection = () => {
        if (!selectedDate) {
            return (
                <EmptySection
                    icon="calendar"
                    title="Select a day to see what's happening 🚀"
                    description="Click on any date to view your announcements, assignments, and exams"
                />
            );
        }

        const dateObj = new Date(selectedDate);
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        const dateStr = dateObj.toLocaleDateString(undefined, options);

        if (
            !selectedEvents ||
            (!selectedEvents.tasks.length &&
                !selectedEvents.exams.length &&
                !selectedEvents.announcements.length)
        ) {
            return (
                <EmptySection
                    icon="calendar"
                    title={`Nothing scheduled for ${dateStr}`}
                    description="You're all clear. Enjoy your day off! 🎉"
                />
            );
        }

        return (
            <div className={styles["details-section"]}>
                <div className={styles["details-header"]}>
                    <i className="far fa-calendar"></i>
                    <span>{dateStr}</span>
                </div>
                <div className={styles["events-list"]}>
                    {[
                        ...selectedEvents.tasks,
                        ...selectedEvents.exams,
                        ...selectedEvents.announcements,
                    ].map((event, index) => (
                        <DayEvent
                            key={`event-${index}`}
                            event_type={event.event_type}
                            title={event.title}
                            subject={event.subject}
                            due={event.due}
                            location={event.location}
                            id={event.id}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <PageSeo
                title="Calendar - CU Portal"
                description="Keep track of your academic schedule with the CU Portal calendar"
            />

            <SubBanner
                title="Student Calendar"
                description="Keep track of your academic schedule"
            />

            <div className={styles["calendar-container"]}>
                <div className={styles["calendar-card"]}>
                    <Calendar
                        eventsData={eventsData}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        onMonthChange={handleMonthChange}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </div>

                {renderDetailsSection()}
            </div>
        </Layout>
    );
};
