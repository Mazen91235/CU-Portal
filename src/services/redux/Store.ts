import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import notificationReducer from "./reducers/NotificationReducer";
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
import { AdminAnnouncementAPI } from "../apis/admin/AnnouncementAPIs";
import { AdminExamAPI } from "../apis/admin/ExamAPIs";
import { AdminLogAPI } from "../apis/admin/LogAPIs";
import { AdminMessageAPI } from "../apis/admin/MessageAPIs";
import { AdminTaskAPI } from "../apis/admin/TaskAPIs";
import { MessageAPI } from "../apis/MessageAPIs";

const store = configureStore({
    reducer: {
        user: userReducer,
        notification: notificationReducer,
        [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
        [DriveAPI.reducerPath]: DriveAPI.reducer,
        [MessageAPI.reducerPath]: MessageAPI.reducer,
        [AnnouncementAPI.reducerPath]: AnnouncementAPI.reducer,
        [CalendarAPI.reducerPath]: CalendarAPI.reducer,
        [CourseAPI.reducerPath]: CourseAPI.reducer,
        [CourseMapAPI.reducerPath]: CourseMapAPI.reducer,
        [ExamAPI.reducerPath]: ExamAPI.reducer,
        [GradeAPI.reducerPath]: GradeAPI.reducer,
        [MaterialAPI.reducerPath]: MaterialAPI.reducer,
        [NotificationAPI.reducerPath]: NotificationAPI.reducer,
        [TaskAPI.reducerPath]: TaskAPI.reducer,
        [UserAPI.reducerPath]: UserAPI.reducer,
        [AdminAnnouncementAPI.reducerPath]: AdminAnnouncementAPI.reducer,
        [AdminCourseAPI.reducerPath]: AdminCourseAPI.reducer,
        [AdminCourseMapAPI.reducerPath]: AdminCourseMapAPI.reducer,
        [AdminDepartmentAPI.reducerPath]: AdminDepartmentAPI.reducer,
        [AdminExamAPI.reducerPath]: AdminExamAPI.reducer,
        [AdminFacultyAPI.reducerPath]: AdminFacultyAPI.reducer,
        [AdminGradeAPI.reducerPath]: AdminGradeAPI.reducer,
        [AdminLogAPI.reducerPath]: AdminLogAPI.reducer,
        [AdminMaterialAPI.reducerPath]: AdminMaterialAPI.reducer,
        [AdminMessageAPI.reducerPath]: AdminMessageAPI.reducer,
        [AdminRoleAPI.reducerPath]: AdminRoleAPI.reducer,
        [AdminTaskAPI.reducerPath]: AdminTaskAPI.reducer,
        [AdminUserAPI.reducerPath]: AdminUserAPI.reducer,
        [AdminYearAPI.reducerPath]: AdminYearAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            AuthenticateAPI.middleware,
            DriveAPI.middleware,
            MessageAPI.middleware,
            AnnouncementAPI.middleware,
            CalendarAPI.middleware,
            CourseAPI.middleware,
            CourseMapAPI.middleware,
            ExamAPI.middleware,
            GradeAPI.middleware,
            MaterialAPI.middleware,
            NotificationAPI.middleware,
            TaskAPI.middleware,
            UserAPI.middleware,
            AdminAnnouncementAPI.middleware,
            AdminCourseAPI.middleware,
            AdminCourseMapAPI.middleware,
            AdminDepartmentAPI.middleware,
            AdminExamAPI.middleware,
            AdminFacultyAPI.middleware,
            AdminGradeAPI.middleware,
            AdminLogAPI.middleware,
            AdminMaterialAPI.middleware,
            AdminMessageAPI.middleware,
            AdminRoleAPI.middleware,
            AdminTaskAPI.middleware,
            AdminUserAPI.middleware,
            AdminYearAPI.middleware,
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
