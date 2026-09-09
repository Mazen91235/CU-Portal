import { useCallback, useState } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { useLazyGetCalendarTasksQuery } from "../../../services/apis/user/CalendarAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type {
    CalendarDayEventDto,
    CalendarDayEventsDto,
} from "../../../types/dtos/CalendarDtos";

import styles from "./TimeLinePage.module.css";
import { Banner } from "../../../components/banner/Banner";
import { MonthPicker } from "../../../components/timeline/MonthPicker";
import { DayEvent } from "../../../components/calendar/DayEvent";
import IconComponent from "../../../components/IconComponent";

const getTimelineDateLabel = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return `${parsedDate.getDate()} ${parsedDate.toLocaleString("en-US", {
        month: "short",
    })}`;
};

const getEventDay = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
};

export const TimeLinePage = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
    );
    const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
    const [getCalendar] = useLazyGetCalendarTasksQuery();

    const selectedMonthDate = new Date(`${selectedMonth}-01T00:00:00`);
    const selectedYear = selectedMonthDate.getFullYear();
    const selectedMonthIndex = selectedMonthDate.getMonth();

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
        () => fetchCalendar(selectedYear, selectedMonthIndex),
        [fetchCalendar, selectedYear, selectedMonthIndex],
    );

    useAuthQuery(authQueryParams);

    const tasks: CalendarDayEventDto[] = Object.values(eventsData)
        .flatMap((dayEvents) => [
            ...dayEvents.tasks,
            ...dayEvents.exams,
            ...dayEvents.announcements,
        ])
        .sort((a, b) => {
            const first = new Date(a.due).getTime();
            const second = new Date(b.due).getTime();

            if (Number.isNaN(first) || Number.isNaN(second)) {
                return a.due.localeCompare(b.due);
            }

            return first - second;
        });

    let previousDay: string | null = null;

    return (
        <Layout>
            <PageSeo
                title="Timeline - CU Portal"
                description="Keep track of your academic schedule with the CU Portal timeline"
            />

            <Banner
                title="Student Timeline"
                description="Keep track of your academic schedule"
            />

            <div className={styles.timelineWrapper}>
                <div className={styles.timelineControls}>
                    <label
                        className={styles.monthSelector}
                        htmlFor="timeline-month"
                    >
                        <MonthPicker
                            onMonthChange={(event) =>
                                setSelectedMonth(
                                    `${event.getFullYear()}-${String(event.getMonth() + 1).padStart(2, "0")}`,
                                )
                            }
                        />
                    </label>
                </div>

                <div
                    className={`${styles.timeline} ${
                        tasks.length === 0 ? styles["timeline-empty"] : ""
                    }`}
                >
                    {tasks.length === 0 ? (
                        <div className={styles.emptyState}>
                            <IconComponent
                                icon="calendar"
                                className={styles.emptyIcon}
                            />
                            <h3>No events for this month</h3>
                            <p>
                                There are no announcements, assignments, or
                                exams scheduled for{" "}
                                {selectedMonthDate.toLocaleDateString(
                                    undefined,
                                    {
                                        month: "long",
                                        year: "numeric",
                                    },
                                )}
                                .
                            </p>
                        </div>
                    ) : (
                        tasks.map((task) => {
                            const currentDay = getEventDay(task.due);
                            const showDate = previousDay !== currentDay;

                            if (showDate) {
                                previousDay = currentDay;
                            }

                            return (
                                <div
                                    className={styles.timelineItem}
                                    key={`${task.due}-${task.id}-${task.event_type}`}
                                >
                                    <div className={styles.timelineDate}>
                                        {showDate &&
                                            getTimelineDateLabel(task.due)}
                                    </div>

                                    <div className={styles.timelineDot} />

                                    <div className={styles.timelineCard}>
                                        <DayEvent {...task} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
};
