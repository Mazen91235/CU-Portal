import { type Icon } from "../types/Icon";

import DefaultAvatar from "../assets/default avatar.png";

import announcementsIcon from "../assets/icons/announcements.png";
import buildingIcon from "../assets/icons/building-icon.svg";
import calendarIcon from "../assets/icons/calendar-icon.svg";
import chatIcon from "../assets/icons/chat.png";
import courseIcon from "../assets/icons/course-icon.svg";
import dashboardPersonalizeIcon from "../assets/icons/dashboard-personalize.png";
import downloadIcon from "../assets/icons/download-icon.svg";
import eventsIcon from "../assets/icons/events.png";
import googleIcon from "../assets/icons/google-icon.svg";
import googleLogoIcon from "../assets/icons/google-logo.png";
import hatIcon from "../assets/icons/hat.png";
import bookSavedIcon from "../assets/icons/iconsax-book-saved.png";
import statusUpIcon from "../assets/icons/iconsax-status-up.png";
import userIcon from "../assets/icons/iconsax-user.png";
import usersAssignedIcon from "../assets/icons/users-assigned.svg";
import permissionsIcon from "../assets/icons/permissions-icon.svg";
import locationIcon from "../assets/icons/location-icon.svg";
import logoIcon from "../assets/icons/logo.png";
import menuIcon from "../assets/icons/menu-icon.svg";
import notificationIcon from "../assets/icons/notification-icon.svg";
import sidebarAcademicSettingsIcon from "../assets/icons/sidebar-academic-settings.svg";
import sidebarAdminAnnouncementsIcon from "../assets/icons/sidebar-admin-announcements.svg";
import sidebarAdminCourseMapsIcon from "../assets/icons/sidebar-admin-course-maps.svg";
import sidebarAdminCoursesIcon from "../assets/icons/sidebar-admin-courses.svg";
import sidebarAdminDashboardIcon from "../assets/icons/sidebar-admin-dashboard.svg";
import sidebarAdminDepartmentsIcon from "../assets/icons/sidebar-admin-departments.svg";
import sidebarAdminDiscussionsIcon from "../assets/icons/sidebar-admin-discussions.svg";
import sidebarAdminEventsIcon from "../assets/icons/sidebar-admin-events.svg";
import sidebarAdminExamsIcon from "../assets/icons/sidebar-admin-exams.svg";
import sidebarAdminFacultiesIcon from "../assets/icons/sidebar-admin-faculties.svg";
import sidebarAdminGradesIcon from "../assets/icons/sidebar-admin-grades.svg";
import sidebarAdminLogsIcon from "../assets/icons/sidebar-admin-logs.svg";
import sidebarAdminMaterialsIcon from "../assets/icons/sidebar-admin-materials.svg";
import sidebarAdminRoadmapsIcon from "../assets/icons/sidebar-admin-roadmaps.svg";
import sidebarAdminRolesIcon from "../assets/icons/sidebar-admin-roles.svg";
import sidebarAdminStudyAnalysisIcon from "../assets/icons/sidebar-admin-study-analysis.svg";
import sidebarAdminStudyMapsIcon from "../assets/icons/sidebar-admin-study-maps.svg";
import sidebarAdminTasksIcon from "../assets/icons/sidebar-admin-tasks.svg";
import sidebarAdminUsersIcon from "../assets/icons/sidebar-admin-users.svg";
import sidebarAdminYearsIcon from "../assets/icons/sidebar-admin-years.svg";
import sidebarAnnouncementsIcon from "../assets/icons/sidebar-announcements.svg";
import sidebarCalendarIcon from "../assets/icons/sidebar-calendar.svg";
import sidebarCoursemapIcon from "../assets/icons/sidebar-coursemap.svg";
import sidebarCoursesIcon from "../assets/icons/sidebar-courses.svg";
import sidebarCvGeneratorIcon from "../assets/icons/sidebar-cv-generator.svg";
import sidebarDiscussionIcon from "../assets/icons/sidebar-discussion.svg";
import sidebarDropdownIcon from "../assets/icons/sidebar-dropdown.svg";
import sidebarEventsIcon from "../assets/icons/sidebar-events.svg";
import sidebarExamsIcon from "../assets/icons/sidebar-exams.svg";
import sidebarGradesIcon from "../assets/icons/sidebar-grades.svg";
import sidebarHomeIcon from "../assets/icons/sidebar-home.svg";
import sidebarLogoutIcon from "../assets/icons/sidebar-logout.svg";
import sidebarMaterialsIcon from "../assets/icons/sidebar-materials.svg";
import sidebarOtherMaterialsIcon from "../assets/icons/sidebar-other-materials.svg";
import sidebarProfileSettingsIcon from "../assets/icons/sidebar-profile-settings.svg";
import sidebarRegisteredCoursesIcon from "../assets/icons/sidebar-registered-courses.svg";
import sidebarRoadmapsIcon from "../assets/icons/sidebar-roadmaps.svg";
import sidebarStudyTrackerIcon from "../assets/icons/sidebar-study-tracker.svg";
import sidebarTasksIcon from "../assets/icons/sidebar-tasks.svg";
import socialFacebookIcon from "../assets/icons/social-facebook.png";
import socialGithubIcon from "../assets/icons/social-github.png";
import socialLinkedinIcon from "../assets/icons/social-linkedin.png";
import socialLinktreeIcon from "../assets/icons/social-linktree.png";
import socialWebsiteIcon from "../assets/icons/social-website.png";
import spinnerEllipse11Icon from "../assets/icons/spinner-ellipse-11.svg";
import spinnerEllipse12Icon from "../assets/icons/spinner-ellipse-12.svg";
import spinnerEllipse13Icon from "../assets/icons/spinner-ellipse-13.svg";
import spinnerEllipse14Icon from "../assets/icons/spinner-ellipse-14.svg";
import spinnerEllipse15Icon from "../assets/icons/spinner-ellipse-15.svg";
import spinnerEllipse16Icon from "../assets/icons/spinner-ellipse-16.svg";
import subjectIcon from "../assets/icons/subject-icon.svg";
import targetIcon from "../assets/icons/target.png";
import taskIcon from "../assets/icons/task-icon.svg";
import timeIcon from "../assets/icons/time-icon.svg";
import trackerIcon from "../assets/icons/tracker.png";
import verifyIcon from "../assets/icons/verify-icon.svg";
import warningCircleIcon from "../assets/icons/warning-circle.svg";

const domain = "https://cu-portal.com";
const version = "v1";
export const GetUserApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/user/${path}`;
};

export const GetAdminApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/admin/${path}`;
};

export const GetApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/${path}`;
};

export const GetWebLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/${path}`;
};

export const GetAvatarLink = (path: string): string => {
    if (!path || path.trim() == "") return DefaultAvatar;
    if (path.startsWith("/")) return GetWebLink(path);
    return path.replace("/uc?export=view&id=", "/thumbnail?sz=1000&id=");
};

export const GetImgFromLink = async (path: string): Promise<File> => {
    if (!path || path.trim() == "") {
        // return a default avatar as File
        const response = await fetch(DefaultAvatar);
        const blob = await response.blob();
        return new File([blob], "default-avatar.png", { type: blob.type });
    }
    if (path.startsWith("/")) {
        const response = await fetch(GetWebLink(path));
        const blob = await response.blob();
        return new File([blob], "avatar.png", { type: blob.type });
    }
    const response = await fetch(path);
    const blob = await response.blob();
    return new File([blob], "avatar.png", { type: blob.type });
};

export const GetIcon = (icon: Icon): string => {
    const iconMap: Record<Icon, string> = {
        announcements: announcementsIcon,
        building: buildingIcon,
        calendar: calendarIcon,
        chat: chatIcon,
        course: courseIcon,
        "dashboard-personalize": dashboardPersonalizeIcon,
        download: downloadIcon,
        events: eventsIcon,
        google: googleIcon,
        "google-logo": googleLogoIcon,
        hat: hatIcon,
        "book-saved": bookSavedIcon,
        "status-up": statusUpIcon,
        user: userIcon,
        "users-assigned": usersAssignedIcon,
        permissions: permissionsIcon,
        location: locationIcon,
        logo: logoIcon,
        menu: menuIcon,
        notification: notificationIcon,
        subject: subjectIcon,
        target: targetIcon,
        task: taskIcon,
        time: timeIcon,
        tracker: trackerIcon,
        verify: verifyIcon,
        "warning-circle": warningCircleIcon,
        "spinner-ellipse-11": spinnerEllipse11Icon,
        "spinner-ellipse-12": spinnerEllipse12Icon,
        "spinner-ellipse-13": spinnerEllipse13Icon,
        "spinner-ellipse-14": spinnerEllipse14Icon,
        "spinner-ellipse-15": spinnerEllipse15Icon,
        "spinner-ellipse-16": spinnerEllipse16Icon,
        "sidebar-dropdown": sidebarDropdownIcon,
        "sidebar-home": sidebarHomeIcon,
        "sidebar-courses": sidebarCoursesIcon,
        "sidebar-coursemap": sidebarCoursemapIcon,
        "sidebar-calendar": sidebarCalendarIcon,
        "sidebar-tasks": sidebarTasksIcon,
        "sidebar-exams": sidebarExamsIcon,
        "sidebar-announcements": sidebarAnnouncementsIcon,
        "sidebar-materials": sidebarMaterialsIcon,
        "sidebar-other-materials": sidebarOtherMaterialsIcon,
        "sidebar-grades": sidebarGradesIcon,
        "sidebar-study-tracker": sidebarStudyTrackerIcon,
        "sidebar-events": sidebarEventsIcon,
        "sidebar-cv-generator": sidebarCvGeneratorIcon,
        "sidebar-roadmaps": sidebarRoadmapsIcon,
        "sidebar-discussion": sidebarDiscussionIcon,
        "sidebar-profile-settings": sidebarProfileSettingsIcon,
        "sidebar-academic-settings": sidebarAcademicSettingsIcon,
        "sidebar-registered-courses": sidebarRegisteredCoursesIcon,
        "sidebar-logout": sidebarLogoutIcon,
        "sidebar-admin-dashboard": sidebarAdminDashboardIcon,
        "sidebar-admin-faculties": sidebarAdminFacultiesIcon,
        "sidebar-admin-departments": sidebarAdminDepartmentsIcon,
        "sidebar-admin-years": sidebarAdminYearsIcon,
        "sidebar-admin-course-maps": sidebarAdminCourseMapsIcon,
        "sidebar-admin-users": sidebarAdminUsersIcon,
        "sidebar-admin-roles": sidebarAdminRolesIcon,
        "sidebar-admin-courses": sidebarAdminCoursesIcon,
        "sidebar-admin-materials": sidebarAdminMaterialsIcon,
        "sidebar-admin-grades": sidebarAdminGradesIcon,
        "sidebar-admin-tasks": sidebarAdminTasksIcon,
        "sidebar-admin-exams": sidebarAdminExamsIcon,
        "sidebar-admin-announcements": sidebarAdminAnnouncementsIcon,
        "sidebar-admin-logs": sidebarAdminLogsIcon,
        "sidebar-admin-roadmaps": sidebarAdminRoadmapsIcon,
        "sidebar-admin-study-maps": sidebarAdminStudyMapsIcon,
        "sidebar-admin-study-analysis": sidebarAdminStudyAnalysisIcon,
        "sidebar-admin-events": sidebarAdminEventsIcon,
        "sidebar-admin-discussions": sidebarAdminDiscussionsIcon,
        "social-facebook": socialFacebookIcon,
        "social-github": socialGithubIcon,
        "social-linkedin": socialLinkedinIcon,
        "social-linktree": socialLinktreeIcon,
        "social-website": socialWebsiteIcon,
    };

    return iconMap[icon];
};
