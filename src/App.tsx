import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { LandingPage } from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import LoginSuccessPage from "./pages/auth/LoginSuccessPage";
import CreateProfilePage from "./pages/auth/CreateProfilePage";
import useGetUser from "./hooks/useGetUser";
import useRouteMessages from "./hooks/useRouteMessages";
import useGetNotifications from "./hooks/useGetNotifications";
import "./App.css";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { UserDashboard } from "./components/user/dashboard/Dashboard";
import { ProfileSettings } from "./pages/user/settings/ProfileSettings";
import { AcademicSettings } from "./pages/user/settings/AcademicSettings";
import { RegisteredCourses } from "./pages/user/settings/RegisteredCourses";
import { FacultiesPage } from "./pages/admin/faculties/FacultiesPage";
import { DepartmentsPage } from "./pages/admin/departments/DepartmentsPage";
import { YearsPage } from "./pages/admin/years/YearsPage";
import { usePageLoading } from "./hooks/usePageLoading";

function App() {
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
            </Route>
        </Routes>
    );
}

export default App;
