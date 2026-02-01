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
import { UserDashboard } from "./components/user/dashboard/Dashboard";
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
import "./App.css";
import useAuth from "./hooks/useAuth";

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
                    <Route path="create" element={<CreateCourse />} />
                    <Route path="edit/:courseId" element={<EditCourse />} />
                    <Route path=":courseId" element={<CoursePage />} />
                </Route>

                <Route
                    path="tasks"
                    element={<ProtectedRoute permission="View Tasks" />}
                >
                    <Route index element={<TasksPage />} />
                    <Route path="create" element={<CreateTask />} />
                    <Route path="edit/:taskId" element={<EditTask />} />
                    <Route path=":taskId" element={<TaskPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
