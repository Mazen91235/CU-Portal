import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import { AuthenticateAPI } from "../apis/AuthenticateAPIs";
import { UserAPI } from "../apis/user/UserAPIs";
import { setupListeners } from "@reduxjs/toolkit/query";
import { NotificationAPI } from "../apis/user/NotificationAPIs";
import { DriveAPI } from "../apis/DriveAPIs";
import { AnnouncementAPI } from "../apis/user/AnnouncementAPIs";
import { CalendarAPI } from "../apis/user/CalendarAPIs";
import { CourseAPI } from "../apis/user/CourseAPIs";
import { CourseMapAPI } from "../apis/user/CourseMapAPIs";
import { ExamAPI } from "../apis/user/ExamAPIs";
import { FileAPI } from "../apis/user/FileAPIs";
import { GradeAPI } from "../apis/user/GradeAPIs";
import { MaterialAPI } from "../apis/user/MaterialAPIs";
import { TaskAPI } from "../apis/user/TaskAPIs";
import { AdminCourseAPI } from "../apis/admin/CourseAPIs";
import { AdminCourseMapAPI } from "../apis/admin/CourseMapAPIs";
import { AdminDepartmentAPI } from "../apis/admin/DepartmentAPIs";
import { AdminFacultyAPI } from "../apis/admin/FacultyAPIs";
import { AdminGradeAPI } from "../apis/admin/GradeAPIs";
import { AdminMaterialAPI } from "../apis/admin/MaterialAPIs";
import { AdminRoleAPI } from "../apis/admin/RoleAPIs";
import { AdminUserAPI } from "../apis/admin/UserAPIs";
import { AdminYearAPI } from "../apis/admin/YearAPIs";

const store = configureStore({
    reducer: {
        user: userReducer,
        [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
        [DriveAPI.reducerPath]: DriveAPI.reducer,
        [AnnouncementAPI.reducerPath]: AnnouncementAPI.reducer,
        [CalendarAPI.reducerPath]: CalendarAPI.reducer,
        [CourseAPI.reducerPath]: CourseAPI.reducer,
        [CourseMapAPI.reducerPath]: CourseMapAPI.reducer,
        [ExamAPI.reducerPath]: ExamAPI.reducer,
        [FileAPI.reducerPath]: FileAPI.reducer,
        [GradeAPI.reducerPath]: GradeAPI.reducer,
        [MaterialAPI.reducerPath]: MaterialAPI.reducer,
        [NotificationAPI.reducerPath]: NotificationAPI.reducer,
        [TaskAPI.reducerPath]: TaskAPI.reducer,
        [UserAPI.reducerPath]: UserAPI.reducer,
        [AdminCourseAPI.reducerPath]: AdminCourseAPI.reducer,
        [AdminCourseMapAPI.reducerPath]: AdminCourseMapAPI.reducer,
        [AdminDepartmentAPI.reducerPath]: AdminDepartmentAPI.reducer,
        [AdminFacultyAPI.reducerPath]: AdminFacultyAPI.reducer,
        [AdminGradeAPI.reducerPath]: AdminGradeAPI.reducer,
        [AdminMaterialAPI.reducerPath]: AdminMaterialAPI.reducer,
        [AdminRoleAPI.reducerPath]: AdminRoleAPI.reducer,
        [AdminUserAPI.reducerPath]: AdminUserAPI.reducer,
        [AdminYearAPI.reducerPath]: AdminYearAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            AuthenticateAPI.middleware,
            DriveAPI.middleware,
            AnnouncementAPI.middleware,
            CalendarAPI.middleware,
            CourseAPI.middleware,
            CourseMapAPI.middleware,
            ExamAPI.middleware,
            FileAPI.middleware,
            GradeAPI.middleware,
            MaterialAPI.middleware,
            NotificationAPI.middleware,
            TaskAPI.middleware,
            UserAPI.middleware,
            AdminCourseAPI.middleware,
            AdminCourseMapAPI.middleware,
            AdminDepartmentAPI.middleware,
            AdminFacultyAPI.middleware,
            AdminGradeAPI.middleware,
            AdminMaterialAPI.middleware,
            AdminRoleAPI.middleware,
            AdminUserAPI.middleware,
            AdminYearAPI.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
