import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import notificationReducer from "./reducers/NotificationReducer";
import processReducer from "./reducers/ProcessReducer";
import { AuthenticateAPI } from "../apis/AuthenticateAPIs";
import { UserAPI } from "../apis/user/UserAPIs";
import { setupListeners } from "@reduxjs/toolkit/query";
import { NotificationAPI } from "../apis/user/NotificationAPIs";
import { DriveAPI } from "../apis/DriveAPIs";
import { AnnouncementAPI } from "../apis/user/AnnouncementAPIs";
import { CalendarAPI } from "../apis/user/CalendarAPIs";
import { CourseAPI } from "../apis/user/CourseAPIs";
import { ExamAPI } from "../apis/user/ExamAPIs";
import { MaterialAPI } from "../apis/user/MaterialAPIs";
import { TaskAPI } from "../apis/user/TaskAPIs";
import { UserFacultyAPI } from "../apis/user/FacultyAPIs";
import { UserDepartmentAPI } from "../apis/user/DepartmentAPIs";
import { UserYearAPI } from "../apis/user/YearAPIs";

import { AdminCourseAPI } from "../apis/admin/CourseAPIs";
import { AdminDepartmentAPI } from "../apis/admin/DepartmentAPIs";
import { AdminFacultyAPI } from "../apis/admin/FacultyAPIs";
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
        process: processReducer,
        [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
        [DriveAPI.reducerPath]: DriveAPI.reducer,
        [MessageAPI.reducerPath]: MessageAPI.reducer,
        [AnnouncementAPI.reducerPath]: AnnouncementAPI.reducer,
        [CalendarAPI.reducerPath]: CalendarAPI.reducer,
        [CourseAPI.reducerPath]: CourseAPI.reducer,
        [ExamAPI.reducerPath]: ExamAPI.reducer,
        [MaterialAPI.reducerPath]: MaterialAPI.reducer,
        [NotificationAPI.reducerPath]: NotificationAPI.reducer,
        [TaskAPI.reducerPath]: TaskAPI.reducer,
        [UserAPI.reducerPath]: UserAPI.reducer,
        [UserFacultyAPI.reducerPath]: UserFacultyAPI.reducer,
        [UserDepartmentAPI.reducerPath]: UserDepartmentAPI.reducer,
        [UserYearAPI.reducerPath]: UserYearAPI.reducer,
        [AdminAnnouncementAPI.reducerPath]: AdminAnnouncementAPI.reducer,
        [AdminCourseAPI.reducerPath]: AdminCourseAPI.reducer,
        [AdminDepartmentAPI.reducerPath]: AdminDepartmentAPI.reducer,
        [AdminExamAPI.reducerPath]: AdminExamAPI.reducer,
        [AdminFacultyAPI.reducerPath]: AdminFacultyAPI.reducer,
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
            ExamAPI.middleware,
            MaterialAPI.middleware,
            NotificationAPI.middleware,
            TaskAPI.middleware,
            UserAPI.middleware,
            UserFacultyAPI.middleware,
            UserDepartmentAPI.middleware,
            UserYearAPI.middleware,
            AdminAnnouncementAPI.middleware,
            AdminCourseAPI.middleware,
            AdminDepartmentAPI.middleware,
            AdminExamAPI.middleware,
            AdminFacultyAPI.middleware,
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
