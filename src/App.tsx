import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import useGetUser from "./hooks/useGetUser";
import useRouteMessages from "./hooks/useRouteMessages";
import "./App.css";

function App() {
    useGetUser();
    useRouteMessages();
    return (
        <Routes>
            <Route index element={<div>Landing Page</div>} />
            <Route path="/user" element={<ProtectedRoute />}>
                <Route index element={<div>Dashboard</div>} />
                <Route path="settings" element={<div>Settings</div>} />
            </Route>
            <Route path="/admin" element={<ProtectedRoute />}>
                <Route
                    path="/"
                    element={<ProtectedRoute permission="Access Admin" />}
                >
                    <Route index element={<div>Admin Dashboard</div>} />
                </Route>
                <Route
                    path="/faculties"
                    element={<ProtectedRoute permission="View Faculties" />}
                >
                    <Route index element={<div>Admin Faculties</div>} />
                </Route>
                <Route
                    path="/departments"
                    element={<ProtectedRoute permission="View Departments" />}
                >
                    <Route index element={<div>Admin Departments</div>} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
