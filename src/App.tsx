import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
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

function App() {
    useGetUser();
    useGetNotifications();
    useRouteMessages();
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
                    element={<ProtectedRoute permission="Access Admin" />}
                >
                    <Route index element={<div>Admin Dashboard</div>} />
                </Route>
                <Route
                    path="faculties"
                    element={<ProtectedRoute permission="View Faculties" />}
                >
                    <Route index element={<div>Admin Faculties</div>} />
                </Route>
                <Route
                    path="departments"
                    element={<ProtectedRoute permission="View Departments" />}
                >
                    <Route index element={<div>Admin Departments</div>} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
