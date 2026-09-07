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
import { formatTime } from "../../../utils/Formatter";

import styles from "./TimeLinePage.module.css";
import { Banner } from "../../../components/banner/Banner";
import { Link } from "react-router";
import { MonthPicker } from "../../../components/timeline/MonthPicker";

const getTimelineDateLabel = (date: string) => {
  const parsedDate = new Date(`${date}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return `${parsedDate.getDate()} ${parsedDate.toLocaleString("en-US", { month: "short" })}`;
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

  const tasks: CalendarDayEventDto[] = Object.entries(eventsData)
    .flatMap(([_, dayEvents]) => [
      ...dayEvents.tasks,
      ...dayEvents.exams,
      ...dayEvents.announcements,
    ])
    .sort((a, b) => b.due.localeCompare(a.due));

  const getViewLink = (
    event_type: CalendarDayEventDto["event_type"],
    id: number,
  ): string => {
    switch (event_type) {
      case "exam":
        return `/user/exams/${id}`;
      case "assignment":
        return `/user/tasks/${id}`;
      case "announcement":
        return `/user/announcements/${id}`;
      default:
        return "#";
    }
  };

  let previousDate: string | null = null;
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
          <label className={styles.monthSelector} htmlFor="timeline-month">
            <MonthPicker
              onMonthChange={(event) =>
                setSelectedMonth(
                  `${event.getFullYear()}-${String(event.getMonth() + 1).padStart(2, "0")}`,
                )
              }
            />
          </label>
        </div>

        <div className={styles.timeline}>
          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>No events for this month</h3>
              <p>
                There are no announcements, assignments, or exams scheduled for{" "}
                {selectedMonthDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const showDate = previousDate !== task.due;

              if (showDate) {
                previousDate = task.due;
              }
              return (
                <div
                  className={styles.timelineItem}
                  key={`${task.due}-${task.id}-${task.event_type}`}
                >
                  <div className={styles.timelineDate}>
                    {showDate && getTimelineDateLabel(task.due)}
                  </div>

                  <div className={styles.timelineDot} />

                  <div className={styles.timelineCard}>
                    <div className={styles.cardHeader}>
                      <h3>{task.title}</h3>

                      <span className={styles.course}>
                        {task.subject || "General"}
                      </span>
                    </div>

                    <div className={styles.taskInfo}>
                      {task.due && <span>◷ {formatTime(task.due)}</span>}

                      {task.location && <span>⌖ {task.location}</span>}
                    </div>

                    <div className={styles.cardFooter}>
                      <span
                        className={`${styles.badge} ${
                          styles[task.event_type.toLowerCase()]
                        }`}
                      >
                        {task.event_type}
                      </span>

                      <Link
                        to={getViewLink(task.event_type, task.id)}
                        className={styles.viewButton}
                      >
                        <div className={styles["view-btn"]}>View</div>
                        {/* <div className={styles["view-btn"]}>View {getBadgeText()}</div> */}
                      </Link>
                    </div>
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
