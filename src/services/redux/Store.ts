import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import notificationReducer from "./reducers/NotificationReducer";
import processReducer from "./reducers/ProcessReducer";
import releaseReducer from "./reducers/ReleaseReducer";
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
import { NoteAPI } from "../apis/user/NoteAPIs";
import { TaskAPI } from "../apis/user/TaskAPIs";
import { FacultyAPI } from "../apis/user/FacultyAPIs";
import { DepartmentAPI } from "../apis/user/DepartmentAPIs";
import { YearAPI } from "../apis/user/YearAPIs";
import { EventAPI } from "../apis/user/EventAPIs";
import { EventOrganizerAPI } from "../apis/user/EventOrganizerAPIs";

import { AdminCourseAPI } from "../apis/admin/CourseAPIs";
import { AdminDepartmentAPI } from "../apis/admin/DepartmentAPIs";
import { AdminEventAPI } from "../apis/admin/EventAPIs";
import { AdminEventOrganizerAPI } from "../apis/admin/EventOrganizerAPIs";
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
import { AdminWeekAPI } from "../apis/admin/WeekAPIs";
import { WeekAPI } from "../apis/user/WeekAPIs";
import { AdminReleaseAPI } from "../apis/admin/ReleaseAPIs";

import { MessageAPI } from "../apis/MessageAPIs";
import { ReleaseAPI } from "../apis/user/ReleaseAPIs";

const store = configureStore({
  reducer: {
    user: userReducer,
    notification: notificationReducer,
    process: processReducer,
    release: releaseReducer,
    [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
    [DriveAPI.reducerPath]: DriveAPI.reducer,
    [MessageAPI.reducerPath]: MessageAPI.reducer,
    [AnnouncementAPI.reducerPath]: AnnouncementAPI.reducer,
    [CalendarAPI.reducerPath]: CalendarAPI.reducer,
    [CourseAPI.reducerPath]: CourseAPI.reducer,
    [ExamAPI.reducerPath]: ExamAPI.reducer,
    [MaterialAPI.reducerPath]: MaterialAPI.reducer,
    [NoteAPI.reducerPath]: NoteAPI.reducer,
    [NotificationAPI.reducerPath]: NotificationAPI.reducer,
    [TaskAPI.reducerPath]: TaskAPI.reducer,
    [UserAPI.reducerPath]: UserAPI.reducer,
    [FacultyAPI.reducerPath]: FacultyAPI.reducer,
    [DepartmentAPI.reducerPath]: DepartmentAPI.reducer,
    [YearAPI.reducerPath]: YearAPI.reducer,
    [EventAPI.reducerPath]: EventAPI.reducer,
    [EventOrganizerAPI.reducerPath]: EventOrganizerAPI.reducer,
    [WeekAPI.reducerPath]: WeekAPI.reducer,
    [AdminAnnouncementAPI.reducerPath]: AdminAnnouncementAPI.reducer,
    [AdminCourseAPI.reducerPath]: AdminCourseAPI.reducer,
    [AdminDepartmentAPI.reducerPath]: AdminDepartmentAPI.reducer,
    [AdminEventAPI.reducerPath]: AdminEventAPI.reducer,
    [AdminEventOrganizerAPI.reducerPath]: AdminEventOrganizerAPI.reducer,
    [AdminExamAPI.reducerPath]: AdminExamAPI.reducer,
    [AdminFacultyAPI.reducerPath]: AdminFacultyAPI.reducer,
    [AdminLogAPI.reducerPath]: AdminLogAPI.reducer,
    [AdminMaterialAPI.reducerPath]: AdminMaterialAPI.reducer,
    [AdminMessageAPI.reducerPath]: AdminMessageAPI.reducer,
    [AdminRoleAPI.reducerPath]: AdminRoleAPI.reducer,
    [AdminTaskAPI.reducerPath]: AdminTaskAPI.reducer,
    [AdminUserAPI.reducerPath]: AdminUserAPI.reducer,
    [AdminYearAPI.reducerPath]: AdminYearAPI.reducer,
    [AdminWeekAPI.reducerPath]: AdminWeekAPI.reducer,
    [AdminReleaseAPI.reducerPath]: AdminReleaseAPI.reducer,
    [ReleaseAPI.reducerPath]: ReleaseAPI.reducer,
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
      NoteAPI.middleware,
      NotificationAPI.middleware,
      TaskAPI.middleware,
      UserAPI.middleware,
      FacultyAPI.middleware,
      DepartmentAPI.middleware,
      YearAPI.middleware,
      EventAPI.middleware,
      EventOrganizerAPI.middleware,
      WeekAPI.middleware,
      AdminAnnouncementAPI.middleware,
      AdminCourseAPI.middleware,
      AdminDepartmentAPI.middleware,
      AdminEventAPI.middleware,
      AdminEventOrganizerAPI.middleware,
      AdminExamAPI.middleware,
      AdminFacultyAPI.middleware,
      AdminLogAPI.middleware,
      AdminMaterialAPI.middleware,
      AdminMessageAPI.middleware,
      AdminRoleAPI.middleware,
      AdminTaskAPI.middleware,
      AdminUserAPI.middleware,
      AdminYearAPI.middleware,
      AdminWeekAPI.middleware,
      AdminReleaseAPI.middleware,
      ReleaseAPI.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
