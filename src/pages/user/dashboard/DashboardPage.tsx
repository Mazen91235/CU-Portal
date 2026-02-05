import { useState, useCallback, useMemo } from "react";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import { useLazyGetAnnouncementsQuery } from "../../../services/apis/user/AnnouncementAPIs";
import { useLazyGetExamsQuery } from "../../../services/apis/user/ExamAPIs";
import { useLazyGetTasksQuery } from "../../../services/apis/user/TaskAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { Subject } from "../../../types/entities/Subject";
import type { Announcement } from "../../../types/entities/Announcement";
import type { Task } from "../../../types/entities/Task";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";

export const DashboardPage = () => {
    const user = useAppSelector((state) => state.user.user);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [exams, setExams] = useState<Task[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [courses, setCourses] = useState<Subject[]>([]);

    const [getEnrolledCourses] = useLazyGetEnrolledCoursesQuery();
    const [getAnnouncements] = useLazyGetAnnouncementsQuery();
    const [getExams] = useLazyGetExamsQuery();
    const [getTasks] = useLazyGetTasksQuery();

    const fetchDashboardData = useCallback(async () => {
        try {
            if ((user?.level || 1) < 4) return;
            const [
                coursesResult,
                announcementsResult,
                examsResult,
                tasksResult,
            ] = await Promise.all([
                getEnrolledCourses().unwrap(),
                getAnnouncements({ page: 1 }).unwrap(),
                getExams({ page: 1, limit: 3 }).unwrap(),
                getTasks({ page: 1, limit: 3 }).unwrap(),
            ]);
            setCourses(coursesResult.data || []);
            setAnnouncements((announcementsResult.data || []).slice(0, 3));
            setExams((examsResult.data || []).slice(0, 3));
            setTasks((tasksResult.data || []).slice(0, 3));
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEnrolledCourses, getAnnouncements, getExams, getTasks, user]);

    const authQueryParams = useCallback(
        () => fetchDashboardData(),
        [fetchDashboardData],
    );

    useAuthQuery(authQueryParams);

    const userLevel = useMemo(() => user?.level || 1, [user]);

    return (
        <Layout>
            <PageSeo
                title="Dashboard - CU Portal"
                description="Your personal dashboard to manage your academic journey at CU Portal"
            />

            {user && userLevel < 4 ? (
                <DashboardProgressView userLevel={userLevel} user={user} />
            ) : user ? (
                <DashboardCompleteView
                    user={user}
                    courses={courses}
                    announcements={announcements}
                    exams={exams}
                    tasks={tasks}
                />
            ) : null}
        </Layout>
    );
};
