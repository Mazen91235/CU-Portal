import { useCallback, useMemo, useState } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { useLazyGetCalendarTasksQuery } from "../../../services/apis/user/CalendarAPIs";
import { useLazyGetWeeksQuery } from "../../../services/apis/user/WeekAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { CalendarDayEventsDto } from "../../../types/dtos/CalendarDtos";
import type { NoteResponseDto } from "../../../types/dtos/NoteDtos";
import { Banner } from "../../../components/banner/Banner";
import { MonthPicker } from "../../../components/timeline/MonthPicker";
import { CalendarNoteCard } from "../../../components/calendar/CalendarNoteCard";
import { CalendarEventCard } from "../../../components/calendar/CalendarEventCard";
import { DayEvent } from "../../../components/calendar/DayEvent";
import { NotePopup } from "../../../components/notes/NotePopup";
import IconComponent from "../../../components/IconComponent";
import { useAppSelector } from "../../../services/redux/Hooks";
import { formatDateTime } from "../../../utils/Formatter";
import styles from "./TimeLinePage.module.css";
import {
  getCalendarDateKey,
  normalizeCalendarEvents,
} from "../../../utils/CalendarHandler";

const getTimelineDateLabel = (date: string) => {
  const calendarDate = getCalendarDateKey(date);
  if (!calendarDate) return date;
  const [year, month, day] = calendarDate.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  return `${parsedDate.getDate()} ${parsedDate.toLocaleString("en-US", { month: "short" })}`;
};

export const TimeLinePage = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );
  const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
  const [getCalendar] = useLazyGetCalendarTasksQuery();
  const [getWeeks] = useLazyGetWeeksQuery();
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string | null>(null);
  const user = useAppSelector((state) => state.user.user);
  const [viewedNote, setViewedNote] = useState<NoteResponseDto | null>(null);

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
        setEventsData(normalizeCalendarEvents(result.data?.events || {}));
      } catch (error) {
        handlePopupErrors(error);
      }
    },
    [getCalendar],
  );

  useAuthQuery(
    useCallback(
      () => fetchCalendar(selectedYear, selectedMonthIndex),
      [fetchCalendar, selectedYear, selectedMonthIndex],
    ),
  );

  const academicWeekFilter = useMemo(
    () => ({
      faculty_id: user?.faculty?.id || undefined,
      department_id: user?.department?.id || undefined,
      year_id: user?.year?.id || undefined,
    }),
    [user],
  );

  const fetchCurrentWeek = useCallback(async () => {
    const today = new Date().toLocaleDateString("en-CA");
    let selectedWeek = (
      await getWeeks({
        data: { ...academicWeekFilter, start_date_includes: today },
        order_by: ["start_date"],
        limit: 1,
      }).unwrap()
    ).data?.[0];

    if (!selectedWeek) {
      selectedWeek = (
        await getWeeks({
          data: { ...academicWeekFilter, start_date_to: today },
          order_by: ["start_date"],
          descending: true,
          limit: 1,
        }).unwrap()
      ).data?.[0];
    }

    if (!selectedWeek) {
      selectedWeek = (
        await getWeeks({
          data: { ...academicWeekFilter, start_date_from: today },
          order_by: ["start_date"],
          limit: 1,
        }).unwrap()
      ).data?.[0];
    }

    setCurrentWeekStartDate(selectedWeek?.start_date || null);
  }, [academicWeekFilter, getWeeks]);

  useAuthQuery(fetchCurrentWeek);

  const currentWeekRange = useMemo(() => {
    if (!currentWeekStartDate) return null;

    const start = new Date(formatDateTime(currentWeekStartDate, true));
    if (Number.isNaN(start.getTime())) return null;

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }, [currentWeekStartDate]);

  const isCurrentWeekDate = useCallback(
    (date: string) =>
      !!currentWeekRange &&
      date >= currentWeekRange.start &&
      date <= currentWeekRange.end,
    [currentWeekRange],
  );

  const days = useMemo(
    () =>
      Object.entries(eventsData)
        .map(([date, events]) => ({ date, events }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [eventsData],
  );

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

        <div
          className={`${styles.timeline} ${days.length === 0 ? styles["timeline-empty"] : ""}`}
        >
          {days.length === 0 ? (
            <div className={styles.emptyState}>
              <IconComponent icon="calendar" className={styles.emptyIcon} />
              <h3>No events for this month</h3>
              <p>
                There are no announcements, assignments, exams, events, or notes
                scheduled for{" "}
                {selectedMonthDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            </div>
          ) : (
            days.map(({ date, events }) => {
              const firstDateSource =
                events.notes?.[0]?.date ||
                events.events?.[0]?.start_date ||
                events.announcements[0]?.due ||
                events.exams[0]?.due ||
                events.tasks[0]?.due ||
                date;

              return (
                <article className={styles.timelineDay} key={date}>
                  <div className={styles.timelineDate}>
                    {getTimelineDateLabel(firstDateSource)}
                  </div>
                  <div className={styles.timelineMarker}>
                    <span className={`${styles.timelineDot} ${isCurrentWeekDate(date) ? styles.timelineDotCurrent : ""}`} />
                  </div>
                  <div className={styles.timelineDayContent}>
                    {!!events.notes?.length && (
                      <section className={styles.timelineSection}>
                        <h3 className={styles.sectionTitle}>Notes</h3>
                        {events.notes.map((note) => (
                          <div className={styles.timelineItem} key={note.id}>
                            <span className={`${styles.timelineItemDot} ${isCurrentWeekDate(date) ? styles.timelineItemDotCurrent : ""}`} />
                            <CalendarNoteCard
                              note={note}
                              onView={() => setViewedNote(note)}
                              viewButtonPlacement="inline"
                            />
                          </div>
                        ))}
                      </section>
                    )}

                    {!!events.events?.length && (
                      <section className={styles.timelineSection}>
                        <h3 className={styles.sectionTitle}>Events</h3>
                        {events.events.map((event) => (
                          <div className={styles.timelineItem} key={event.id}>
                            <span className={`${styles.timelineItemDot} ${isCurrentWeekDate(date) ? styles.timelineItemDotCurrent : ""}`} />
                            <CalendarEventCard event={event} />
                          </div>
                        ))}
                      </section>
                    )}

                    {!!events.announcements.length && (
                      <section className={styles.timelineSection}>
                        <h3 className={styles.sectionTitle}>Announcements</h3>
                        {events.announcements.map((event) => (
                          <div
                            className={styles.timelineItem}
                            key={`${event.id}-${event.due}`}
                          >
                            <span className={`${styles.timelineItemDot} ${isCurrentWeekDate(date) ? styles.timelineItemDotCurrent : ""}`} />
                            <DayEvent {...event} />
                          </div>
                        ))}
                      </section>
                    )}

                    {!!events.exams.length && (
                      <section className={styles.timelineSection}>
                        <h3 className={styles.sectionTitle}>Exams</h3>
                        {events.exams.map((event) => (
                          <div
                            className={styles.timelineItem}
                            key={`${event.id}-${event.due}`}
                          >
                            <span className={`${styles.timelineItemDot} ${isCurrentWeekDate(date) ? styles.timelineItemDotCurrent : ""}`} />
                            <DayEvent {...event} />
                          </div>
                        ))}
                      </section>
                    )}

                    {!!events.tasks.length && (
                      <section className={styles.timelineSection}>
                        <h3 className={styles.sectionTitle}>Assignments</h3>
                        {events.tasks.map((event) => (
                          <div
                            className={styles.timelineItem}
                            key={`${event.id}-${event.due}`}
                          >
                            <span className={`${styles.timelineItemDot} ${isCurrentWeekDate(date) ? styles.timelineItemDotCurrent : ""}`} />
                            <DayEvent {...event} />
                          </div>
                        ))}
                      </section>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      <NotePopup
        isOpen={!!viewedNote}
        note={viewedNote}
        onClose={() => setViewedNote(null)}
      />
    </Layout>
  );
};
