import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import type { UserResponseDto } from "../../types/dtos/UserDtos";
import type { SubjectResponseDto } from "../../types/dtos/SubjectDtos";
import type { AnnouncementResponseDto } from "../../types/dtos/AnnouncementDtos";
import type { TaskResponseDto } from "../../types/dtos/TaskDtos";
import type { ExamResponseDto } from "../../types/dtos/ExamDtos";
import type {
    CalendarDayEventsDto,
} from "../../types/dtos/CalendarDtos";
import { Calendar } from "../../components/calendar/Calendar";
import { FloatingDay } from "../../components/calendar/FloatingDay";
import { Card } from "../../components/card/Card";

import emailIcon from "../../assets/icons/email.svg";
import phoneIcon from "../../assets/icons/phone.svg";
import coursesWhiteIcon from "../../assets/icons/courses-white.svg";
import announcementsWhiteIcon from "../../assets/icons/announcements-white.svg";
import dashboardExamsIcon from "../../assets/icons/dashboard-exams-icon.svg";
import dashboardTasksIcon from "../../assets/icons/dashboard-tasks-icon.svg";

import styles from "./DashboardCompleteView.module.css";
import { useLazyGetCalendarTasksQuery } from "../../services/apis/user/CalendarAPIs";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import useAuthQuery from "../../hooks/useAuthQuery";
import {
    captitalize,
    formatDateTime,
    formatString,
} from "../../utils/Formatter";
import { Avatar } from "../avatar/Avatar";
import { useLazyGetExamsQuery } from "../../services/apis/user/ExamAPIs";
import { useLazyGetTasksQuery } from "../../services/apis/user/TaskAPIs";
import { useLazyGetAnnouncementsQuery } from "../../services/apis/user/AnnouncementAPIs";
import { useLazyGetEnrolledCoursesQuery } from "../../services/apis/user/CourseAPIs";
import type { NoteFormData } from "../notes/NoteForm";
import { useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from "../../services/apis/user/NoteAPIs";
import type { NoteResponseDto, NoteUpdateDto } from "../../types/dtos/NoteDtos";
import { normalizeCalendarEvents } from "../../utils/CalendarHandler";

export const DashboardCompleteView = ({ user }: { user: UserResponseDto }) => {
    const [getExams] = useLazyGetExamsQuery();
    const [getTasks] = useLazyGetTasksQuery();
    const [getAnnouncements] = useLazyGetAnnouncementsQuery();
    const [getCourses] = useLazyGetEnrolledCoursesQuery();
    const [getCalendar] = useLazyGetCalendarTasksQuery();
    const [createNote, { isLoading: isCreatingNote }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdatingNote }] = useUpdateNoteMutation();
    const [deleteNote, { isLoading: isDeletingNote }] = useDeleteNoteMutation();
    const navigate = useNavigate();
    const [exams, setExams] = useState<ExamResponseDto[]>([]);
    const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
    const [announcements, setAnnouncements] = useState<
        AnnouncementResponseDto[]
    >([]);
    const [courses, setCourses] = useState<SubjectResponseDto[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isFloatingDayOpen, setIsFloatingDayOpen] = useState(false);

    const fetchExams = useCallback(async () => {
        try {
            const result = await getExams({
                includes: ["subject"],
                limit: 3,
            }).unwrap();
            setExams(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getExams]);

    const fetchTasks = useCallback(async () => {
        try {
            const result = await getTasks({
                includes: ["subject"],
                limit: 3,
            }).unwrap();
            setTasks(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getTasks]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const result = await getAnnouncements({
                includes: ["subject"],
                limit: 3,
            }).unwrap();
            setAnnouncements(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getAnnouncements]);

    const fetchCourses = useCallback(async () => {
        try {
            const result = await getCourses().unwrap();
            setCourses(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getCourses]);

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

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchExams(),
                fetchTasks(),
                fetchAnnouncements(),
                fetchCourses(),
                fetchCalendar(currentYear, currentMonth),
            ]),
        [
            fetchExams,
            fetchTasks,
            fetchAnnouncements,
            fetchCourses,
            fetchCalendar,
            currentYear,
            currentMonth,
        ],
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
        setIsFloatingDayOpen(true);
    };

    const handleMonthChange = (year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
    };

    const handleSaveNote = async (data: NoteFormData) => {
        if (!selectedDate) return;
        await createNote({ ...data, date: data.date || selectedDate }).unwrap();
        await fetchCalendar(currentYear, currentMonth);
    };

    const handleUpdateNote = async (note: NoteResponseDto, data: NoteUpdateDto) => {
        if (!note.id) return;
        await updateNote({ note_id: note.id, ...data }).unwrap();
        await fetchCalendar(currentYear, currentMonth);
    };

    const handleDeleteNote = async (note: NoteResponseDto) => {
        if (!note.id) return;
        await deleteNote({ note_id: note.id }).unwrap();
        await fetchCalendar(currentYear, currentMonth);
    };

    const notesBusy = isCreatingNote || isUpdatingNote || isDeletingNote;

    const selectedEvents = selectedDate && eventsData[selectedDate]
        ? eventsData[selectedDate]
        : { tasks: [], exams: [], announcements: [], events: [], notes: [] };

    return (
        <div className={styles["dashboard-container"]}>
            <div className={styles["main-column"]}>
                <div className={styles["calendar-section"]}>
                    <h4 className={styles["section-title"]}>Calendar</h4>
                    <div className={styles["calendar-wrapper"]}>
                        <Calendar
                            eventsData={eventsData}
                            onDateSelect={handleDateSelect}
                            onMonthChange={handleMonthChange}
                            selectedDate={selectedDate}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                        />
                    </div>
                </div>

                {isFloatingDayOpen && selectedDate && (
                    <FloatingDay
                        isOpen={isFloatingDayOpen}
                        onClose={() => setIsFloatingDayOpen(false)}
                        dateStr={selectedDate}
                        events={selectedEvents}
                        onSaveNote={handleSaveNote}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                        busy={notesBusy}
                    />
                )}

                <div className={styles["exams-overview"]}>
                    <div className={styles["section-header"]}>
                        <h5 className={styles["section-heading"]}>
                            <img src={dashboardExamsIcon} alt="exam" />
                            Exams Overview
                        </h5>
                        <Link
                            to="/user/exams"
                            className={styles["view-all-btn"]}
                        >
                            Show All
                        </Link>
                    </div>
                    <div className={styles["cards-container"]}>
                        {exams.map((exam) => (
                            <Card
                                key={exam.id}
                                title={exam.name ?? "Untitled Exam"}
                                badge="Exam"
                                items={[
                                    {
                                        icon: "subject",
                                        label: "Subject",
                                        value: exam.subject?.name || "N/A",
                                        color: "green",
                                    },
                                    {
                                        icon: "time",
                                        label: "Due",
                                        value:
                                            formatDateTime(exam.deadline) ||
                                            "N/A",
                                        color: "orange",
                                    },
                                    ...(exam.details?.location
                                        ? [
                                              {
                                                  icon: "location" as const,
                                                  label: "Location",
                                                  value: exam.details.location,
                                                  color: "pink" as const,
                                              },
                                          ]
                                        : []),
                                ]}
                                button="View Exam"
                                buttonAction={() =>
                                    navigate(`/user/exams/${exam.id}`)
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className={styles["tasks-overview"]}>
                    <div className={styles["section-header"]}>
                        <h5 className={styles["section-heading"]}>
                            <img src={dashboardTasksIcon} alt="task" />
                            Tasks Overview
                        </h5>
                        <Link
                            to="/user/tasks"
                            className={styles["view-all-btn"]}
                        >
                            Show All
                        </Link>
                    </div>
                    <div
                        className={`${styles["cards-container"]} ${styles["tasks-cards"]}`}
                    >
                        {tasks.map((task) => (
                            <Card
                                key={task.id}
                                title={task.name ?? "Untitled Task"}
                                badge="Task"
                                items={[
                                    {
                                        icon: "subject",
                                        label: "Subject",
                                        value: task.subject?.name || "N/A",
                                        color: "green",
                                    },
                                    {
                                        icon: "time",
                                        label: "Due",
                                        value:
                                            formatDateTime(task.deadline) ||
                                            "N/A",
                                        color: "orange",
                                    },
                                ]}
                                button="View Task"
                                buttonAction={() =>
                                    navigate(`/user/tasks/${task.id}`)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles["sidebar-column"]}>
                <div className={styles["user-card"]}>
                    <div className={styles["user-card-header"]}>
                        <span className={styles["user-role"]}>
                            {captitalize(user.role?.name || undefined)}
                        </span>
                    </div>
                    <Avatar
                        user={user}
                        size="large"
                        className={styles["user-avatar"]}
                    />
                    <h3 className={styles["user-name"]}>{user.name}</h3>
                    <div className={styles["user-academic-details"]}>
                        <div>
                            <span>Faculty</span>
                            <span>{user.faculty?.name || "N/A"}</span>
                        </div>
                        <div className={styles["separator"]}></div>
                        <div>
                            <span>Department</span>
                            <span>{user.department?.name || "N/A"}</span>
                        </div>
                        <div className={styles["separator"]}></div>
                        <div>
                            <span>Year</span>
                            <span>{user.year?.year || "N/A"}</span>
                        </div>
                    </div>
                    <div className={styles["user-details"]}>
                        <h5>
                            <img src={emailIcon} alt="Email" />
                            <span>{user.email}</span>
                        </h5>
                        <h5>
                            <img src={phoneIcon} alt="Phone" />
                            <span>{user.phone || "N/A"}</span>
                        </h5>
                    </div>
                </div>

                <div className={styles["my-courses"]}>
                    <div className={styles["courses-header"]}>
                        <h5>
                            <img src={coursesWhiteIcon} alt="book" />
                            My Courses
                        </h5>
                        <Link
                            to="/user/courses"
                            className={styles["courses-view-all"]}
                        >
                            View All
                        </Link>
                    </div>
                    <div className={styles["courses-list"]}>
                        {courses.slice(0, 3).map((course) => (
                            <div
                                key={course.id}
                                className={styles["course-item"]}
                            >
                                <span>{course.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles["user-announcements"]}>
                    <div className={styles["announcements-header"]}>
                        <h5>
                            <img
                                src={announcementsWhiteIcon}
                                alt="announcements"
                            />
                            Announcements
                        </h5>
                        <Link
                            to="/user/announcements"
                            className={styles["announcements-view-all"]}
                        >
                            View All
                        </Link>
                    </div>
                    <div className={styles["announcements-list"]}>
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={styles["announcement-item"]}
                            >
                                <div>
                                    <h6>
                                        {formatString(announcement.title, 30)}
                                    </h6>
                                    <p>
                                        {formatString(announcement.content, 50)}
                                    </p>
                                    <div>
                                        <span>
                                            <i className="far fa-calendar"></i>
                                            {!announcement.date
                                                ? "Created At: " +
                                                  formatDateTime(
                                                      announcement.created_at,
                                                  )
                                                : "Date: " +
                                                  formatDateTime(
                                                      announcement.date,
                                                  )}
                                        </span>
                                        <Link
                                            to={`/user/announcements/${announcement.id}`}
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles["motivation-card"]}>
                    <div className={styles["motivation-emoji"]}>🌟</div>
                    <div className={styles["motivation-text"]}>
                        <strong>You're doing great!</strong>
                    </div>
                    <small>Keep up the momentum</small>
                </div>
            </div>
        </div>
    );
};
