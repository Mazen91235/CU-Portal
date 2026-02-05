import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import type { User } from "../../types/entities/User";
import type { Subject } from "../../types/entities/Subject";
import type { Announcement } from "../../types/entities/Announcement";
import type { Task } from "../../types/entities/Task";
import type { CalendarDayEventsDto } from "../../types/dtos/CalenderDTOs";
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

export const DashboardCompleteView = ({ user }: { user: User }) => {
    const [getExams] = useLazyGetExamsQuery();
    const [getTasks] = useLazyGetTasksQuery();
    const [getAnnouncements] = useLazyGetAnnouncementsQuery();
    const [getCourses] = useLazyGetEnrolledCoursesQuery();
    const [getCalendar] = useLazyGetCalendarTasksQuery();
    const navigate = useNavigate();
    const [exams, setExams] = useState<Task[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [courses, setCourses] = useState<Subject[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isFloatingDayOpen, setIsFloatingDayOpen] = useState(false);

    const fetchExams = useCallback(async () => {
        try {
            const result = await getExams({ limit: 3 }).unwrap();
            setExams(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getExams]);

    const fetchTasks = useCallback(async () => {
        try {
            const result = await getTasks({ limit: 3 }).unwrap();
            setTasks(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getTasks]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const result = await getAnnouncements({ limit: 3 }).unwrap();
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
                    year,
                    month: month + 1,
                }).unwrap();

                setEventsData(result.data || {});
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

    const selectedEvents =
        selectedDate && eventsData[selectedDate]
            ? eventsData[selectedDate]
            : { tasks: [], exams: [] };

    const formattedEvents = [
        ...(selectedEvents.exams || []).map((exam: Task) => ({
            type: "exam" as const,
            title: exam.name || "",
            due: formatDateTime(exam.deadline) || "",
            location: exam.details?.location || "",
            id: exam.id || 0,
        })),
        ...(selectedEvents.tasks || []).map((task: Task) => ({
            type: "assignment" as const,
            title: task.name || "",
            due: formatDateTime(task.deadline) || "",
            location: task.details?.location || "",
            id: task.id || 0,
        })),
    ];

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
                        events={formattedEvents}
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
                                title={exam.name}
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
                            Tasks & Assignments
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
                                title={task.name}
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
                            {captitalize(user.role?.name)}
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
                                            {formatDateTime(
                                                announcement.created_at,
                                            )}
                                        </span>
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
