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
import { DashboardPage } from "./pages/user/dashboard/DashboardPage";
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
import { MaterialsPage as UserMaterialsPage } from "./pages/user/materials/MaterialsPage";
import { CalendarPage } from "./pages/user/calendar/CalendarPage";
import useAuth from "./hooks/useAuth";
import { UsersPage } from "./pages/admin/users/UsersPage";
import { UserPage } from "./pages/admin/users/UserPage";
import { PendingUsersPage } from "./pages/admin/users/PendingUsersPage";
import { RolePage } from "./pages/admin/roles/RolePage";
import { RolesPage } from "./pages/admin/roles/RolesPage";
import { NotificationsPage } from "./pages/user/notifications/NotificationsPage";
import { MaterialsPage } from "./pages/admin/materials/MaterialsPage";
import { PrivacyPolicy } from "./pages/user/terms/PrivacyPolicy";
import { TermsOfService } from "./pages/user/terms/TermsOfService";
import { useValidateUserLevel } from "./hooks/useValidateUserLevel";
import { LogsPage } from "./pages/admin/logs/LogsPage";
import { LogPage } from "./pages/admin/logs/LogPage";

import "./App.css";

function App() {
    useAuth({ shouldNavigate: false });
    useGetUser();
    useGetNotifications();
    useRouteMessages();
    useValidateUserLevel();
    usePageLoading();
    return (
        <Routes>
            <Route index element={<LandingPage />} />
            <Route path="privacy_policy" element={<PrivacyPolicy />} />
            <Route path="terms_of_service" element={<TermsOfService />} />
            <Route path="" element={<ProtectedRoute reverse={true} />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login-success" element={<LoginSuccessPage />} />
                <Route path="/create-profile" element={<CreateProfilePage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>
            <Route path="/user" element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
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
                <Route path="materials">
                    <Route index element={<UserMaterialsPage />} />
                    <Route path=":subjectId" element={<UserMaterialsPage />} />
                    <Route
                        path=":subjectId/:parentId"
                        element={<UserMaterialsPage />}
                    />
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
                    path="users"
                    element={<ProtectedRoute permission="View Users" />}
                >
                    <Route index element={<UsersPage />} />
                    <Route path=":userId" element={<UserPage />} />
                    <Route path="pending" element={<PendingUsersPage />} />
                </Route>

                <Route
                    path="roles"
                    element={<ProtectedRoute permission="View Roles" />}
                >
                    <Route index element={<RolesPage />} />
                    <Route path=":roleId" element={<RolePage />} />
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

                <Route
                    path="materials"
                    element={<ProtectedRoute permission="View Materials" />}
                >
                    <Route index element={<MaterialsPage />} />
                    <Route path=":subjectId" element={<MaterialsPage />} />
                    <Route
                        path=":subjectId/:parentId"
                        element={<MaterialsPage />}
                    />
                </Route>

                <Route
                    path="logs"
                    element={<ProtectedRoute permission="View Logs" /> }
                >
                    <Route index element={<LogsPage />} />
                    <Route path=":logId" element={<LogPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
