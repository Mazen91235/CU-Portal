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
            <Route path="/" element={<div>Landing Page</div>} />
            <Route path="/user" element={<ProtectedRoute />}>
                <Route index element={<div>Dashboard</div>} />
                <Route path="settings" element={<div>Settings</div>} />
            </Route>
        </Routes>
    );
}

export default App;
