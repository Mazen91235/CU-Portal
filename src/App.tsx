import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { LandingPage } from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import LoginSuccessPage from "./pages/auth/LoginSuccessPage";
import CreateProfilePage from "./pages/auth/CreateProfilePage";
import useGetUser from "./hooks/useGetUser";
import useRouteMessages from "./hooks/useRouteMessages";
import useGetNotifications from "./hooks/useGetNotifications";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { Dashboard as UserDashboard } from "./pages/user/dashboard/Dashboard";
import { ProfileSettings } from "./pages/user/settings/ProfileSettings";
import { AcademicSettings } from "./pages/user/settings/AcademicSettings";
import { RegisteredCourses } from "./pages/user/settings/RegisteredCourses";
import { FacultiesPage } from "./pages/admin/faculties/FacultiesPage";
import { DepartmentsPage } from "./pages/admin/departments/DepartmentsPage";
import { YearsPage } from "./pages/admin/years/YearsPage";
import { CoursesPage } from "./pages/admin/courses/CoursesPage";
import { CoursePage } from "./pages/admin/courses/CoursePage";
import { CreateCourse } from "./pages/admin/courses/CreateCourse";
import { EditCourse } from "./pages/admin/courses/EditCourse";
import { usePageLoading } from "./hooks/usePageLoading";
import { CreateTask } from "./pages/admin/tasks/CreateTask";
import { EditTask } from "./pages/admin/tasks/EditTask";
import { TaskPage } from "./pages/admin/tasks/TaskPage";
import { TasksPage } from "./pages/admin/tasks/TasksPage";
import { CreateExam } from "./pages/admin/exams/CreateExam";
import { EditExam } from "./pages/admin/exams/EditExam";
import { ExamPage } from "./pages/admin/exams/ExamPage";
import { ExamsPage } from "./pages/admin/exams/ExamsPage";
import { CreateAnnouncement } from "./pages/admin/announcements/CreateAnnouncement";
import { EditAnnouncement } from "./pages/admin/announcements/EditAnnouncement";
import { AnnouncementPage } from "./pages/admin/announcements/AnnouncementPage";
import { AnnouncementsPage } from "./pages/admin/announcements/AnnouncementsPage";
import { TasksPage as UserTasksPage } from "./pages/user/tasks/TasksPage";
import { TaskPage as UserTaskPage } from "./pages/user/tasks/TaskPage";
import { ExamsPage as UserExamsPage } from "./pages/user/exams/ExamsPage";
import { ExamPage as UserExamPage } from "./pages/user/exams/ExamPage";
import { AnnouncementsPage as UserAnnouncementsPage } from "./pages/user/announcements/AnnouncementsPage";
import { AnnouncementPage as UserAnnouncementPage } from "./pages/user/announcements/AnnouncementPage";
import { CoursesPage as UserCoursesPage } from "./pages/user/courses/CoursesPage";
import { CoursePage as UserCoursePage } from "./pages/user/courses/CoursePage";
import { CalendarPage } from "./pages/user/calendar/CalendarPage";
import useAuth from "./hooks/useAuth";
import "./App.css";

function App() {
    useAuth({ shouldNavigate: false });
    useGetUser();
    useGetNotifications();
    useRouteMessages();
    usePageLoading();
    return (
        <Routes>
            <Route index element={<LandingPage />} />
            <Route path="" element={<ProtectedRoute reverse={true} />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login-success" element={<LoginSuccessPage />} />
                <Route path="/create-profile" element={<CreateProfilePage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>
            <Route path="/user" element={<ProtectedRoute />}>
                <Route index element={<UserDashboard />} />
                <Route path="settings">
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="academic" element={<AcademicSettings />} />
                    <Route path="courses" element={<RegisteredCourses />} />
                </Route>
                <Route path="tasks">
                    <Route index element={<UserTasksPage />} />
                    <Route path=":taskId" element={<UserTaskPage />} />
                </Route>
                <Route path="exams">
                    <Route index element={<UserExamsPage />} />
                    <Route path=":examId" element={<UserExamPage />} />
                </Route>
                <Route path="announcements">
                    <Route index element={<UserAnnouncementsPage />} />
                    <Route
                        path=":announcementId"
                        element={<UserAnnouncementPage />}
                    />
                </Route>
                <Route path="courses">
                    <Route index element={<UserCoursesPage />} />
                    <Route path=":courseId" element={<UserCoursePage />} />
                </Route>
                <Route path="calendar">
                    <Route index element={<CalendarPage />} />
                </Route>
            </Route>
            <Route path="/admin" element={<ProtectedRoute />}>
                <Route
                    path=""
                    element={<ProtectedRoute permission="View Admin Panel" />}
                >
                    <Route index element={<div>Admin Dashboard</div>} />
                </Route>
                <Route
                    path="faculties"
                    element={<ProtectedRoute permission="View Faculties" />}
                >
                    <Route index element={<FacultiesPage />} />
                </Route>
                <Route
                    path="departments"
                    element={<ProtectedRoute permission="View Departments" />}
                >
                    <Route index element={<DepartmentsPage />} />
                </Route>

                <Route
                    path="years"
                    element={<ProtectedRoute permission="View Years" />}
                >
                    <Route index element={<YearsPage />} />
                </Route>

                <Route
                    path="courses"
                    element={<ProtectedRoute permission="View Courses" />}
                >
                    <Route index element={<CoursesPage />} />
                    <Route
                        path="create"
                        element={<ProtectedRoute permission="Add Courses" />}
                    >
                        <Route index element={<CreateCourse />} />
                    </Route>
                    <Route
                        path="edit/:courseId"
                        element={<ProtectedRoute permission="Edit Courses" />}
                    >
                        <Route index element={<EditCourse />} />
                    </Route>
                    <Route path=":courseId" element={<CoursePage />} />
                </Route>

                <Route
                    path="tasks"
                    element={<ProtectedRoute permission="View Tasks" />}
                >
                    <Route index element={<TasksPage />} />
                    <Route
                        path="create"
                        element={<ProtectedRoute permission="Add Tasks" />}
                    >
                        <Route index element={<CreateTask />} />
                    </Route>
                    <Route
                        path="edit/:taskId"
                        element={<ProtectedRoute permission="Edit Tasks" />}
                    >
                        <Route index element={<EditTask />} />
                    </Route>
                    <Route path=":taskId" element={<TaskPage />} />
                </Route>

                <Route
                    path="exams"
                    element={<ProtectedRoute permission="View Exams" />}
                >
                    <Route index element={<ExamsPage />} />
                    <Route
                        path="create"
                        element={<ProtectedRoute permission="Add Exams" />}
                    >
                        <Route index element={<CreateExam />} />
                    </Route>
                    <Route
                        path="edit/:examId"
                        element={<ProtectedRoute permission="Edit Exams" />}
                    >
                        <Route index element={<EditExam />} />
                    </Route>
                    <Route path=":examId" element={<ExamPage />} />
                </Route>

                <Route
                    path="announcements"
                    element={<ProtectedRoute permission="View Announcements" />}
                >
                    <Route index element={<AnnouncementsPage />} />
                    <Route
                        path="create"
                        element={
                            <ProtectedRoute permission="Add Announcements" />
                        }
                    >
                        <Route index element={<CreateAnnouncement />} />
                    </Route>
                    <Route
                        path="edit/:announcementId"
                        element={
                            <ProtectedRoute permission="Edit Announcements" />
                        }
                    >
                        <Route index element={<EditAnnouncement />} />
                    </Route>
                    <Route
                        path=":announcementId"
                        element={<AnnouncementPage />}
                    />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
