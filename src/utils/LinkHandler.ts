import DefaultAvatar from "../assets/default avatar.png";
import { type Icon } from "../types/Icon";
import type { IconType } from "react-icons";

import { IoCheckmarkDoneSharp } from "react-icons/io5";
import {
    FaGraduationCap,
    FaFacebook,
    FaGithub,
    FaLinkedin,
    FaLink,
    FaUserCircle,
    FaIdCard,
    FaScroll,
    FaArrowUp,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsActivity, BsJournalBookmark } from "react-icons/bs";
import { BiTrendingUp } from "react-icons/bi";
import { TfiMenuAlt } from "react-icons/tfi";
import {
    LuBookOpen,
    LuMap,
    LuCalendar,
    LuClipboardList,
    LuListTodo,
    LuMegaphone,
    LuBook,
    LuBadge,
    LuRadar,
    LuCalendarDays,
    LuFileText,
    LuMapPin,
    LuMessageSquare,
    LuLandmark,
    LuBuilding,
    LuUsers,
    LuShield,
    LuActivity,
    LuChevronDown,
    LuChevronUp,
    LuLogOut,
    LuSettings,
    LuBell,
    LuDownload,
    LuEye,
    LuUserCog,
    LuLifeBuoy,
    LuUser,
    LuClock,
    LuPhone,
    LuMail,
    LuTarget,
    LuMonitor,
    LuPaperclip,
    LuHexagon,
    LuLayoutDashboard,
    LuMessagesSquare,
    LuChartNetwork,
    LuCircleCheck,
    LuShare2,
    LuCopy,
    LuMove,
    LuSquarePen,
    LuTrash,
    LuX,
    LuCircleAlert,
} from "react-icons/lu";
import { FiBookOpen, FiHome } from "react-icons/fi";
import { FaRegNoteSticky } from "react-icons/fa6";
import { RiGuideLine } from "react-icons/ri";
import spinnerEllipse11Icon from "../assets/icons/spinner-ellipse-11.svg";
import spinnerEllipse12Icon from "../assets/icons/spinner-ellipse-12.svg";
import spinnerEllipse13Icon from "../assets/icons/spinner-ellipse-13.svg";
import spinnerEllipse14Icon from "../assets/icons/spinner-ellipse-14.svg";
import spinnerEllipse15Icon from "../assets/icons/spinner-ellipse-15.svg";
import spinnerEllipse16Icon from "../assets/icons/spinner-ellipse-16.svg";

const apiDomain = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const GetUserApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/user/${path}`;
};

export const GetAdminApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/admin/${path}`;
};

export const GetApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/${path}`;
};

export const GetWebLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/${path}`;
};

export const GetAvatarLink = (path: string): string => {
    if (!path || path.trim() == "") return DefaultAvatar;
    if (path.startsWith("/")) return GetApiLink(path);
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
        const response = await fetch(GetApiLink(path));
        const blob = await response.blob();
        return new File([blob], "avatar.png", { type: blob.type });
    }
    const response = await fetch(path);
    const blob = await response.blob();
    return new File([blob], "avatar.png", { type: blob.type });
};

export const GetIcon = (icon: Icon | string): IconType | string => {
    const iconMap: Record<string, IconType | string> = {
        announcements: LuMegaphone,
        building: LuBuilding,
        calendar: LuCalendar,
        chat: LuMessageSquare,
        course: LuBookOpen,
        "dashboard-personalize": LuLayoutDashboard,
        download: LuDownload,
        events: LuCalendarDays,
        google: FcGoogle,
        "google-logo": FcGoogle,
        hat: FaGraduationCap,
        "book-saved": BsJournalBookmark,
        "status-up": BiTrendingUp,
        user: LuUser,
        users: LuUsers,
        "users-total": LuUsers,
        "users-assigned": LuUsers,
        "user-details": LuUser,
        "user-default-avatar": FaUserCircle,
        permissions: LuShield,
        location: LuMapPin,
        logo: LuHexagon,
        menu: TfiMenuAlt,
        "checkmark-done": IoCheckmarkDoneSharp,
        notification: LuBell,
        help: LuLifeBuoy,

        subject: LuBookOpen,
        "subjects-icon": LuBookOpen,
        target: LuTarget,
        task: LuClipboardList,
        "task-details-icon": LuFileText,

        time: LuClock,
        tracker: FaGraduationCap,
        "warning-circle": LuCircleAlert,
        "view-icon": LuEye,

        "spinner-ellipse-11": spinnerEllipse11Icon,
        "spinner-ellipse-12": spinnerEllipse12Icon,
        "spinner-ellipse-13": spinnerEllipse13Icon,
        "spinner-ellipse-14": spinnerEllipse14Icon,
        "spinner-ellipse-15": spinnerEllipse15Icon,
        "spinner-ellipse-16": spinnerEllipse16Icon,

        "sidebar-dropdown": LuChevronDown,
        "sidebar-dropup": LuChevronUp,

        "sidebar-courses": LuBookOpen,
        "sidebar-coursemap": LuMap,
        "sidebar-calendar": LuCalendar,
        "sidebar-timeline": LuChartNetwork,
        "sidebar-tasks": LuClipboardList,
        "sidebar-exams": LuListTodo,
        "sidebar-announcements": LuMegaphone,
        "sidebar-events": LuCalendarDays,
        "sidebar-event-organizers": LuUsers,
        "sidebar-materials": LuBookOpen,
        "sidebar-other-materials": LuBook,
        "sidebar-grades": LuBadge,
        "sidebar-study-tracker": LuRadar,
        "sidebar-cv-generator": LuFileText,
        "sidebar-weekly-guide": RiGuideLine,
        "sidebar-roadmaps": LuMapPin,
        "sidebar-discussion": LuMessagesSquare,
        "sidebar-profile-settings": LuUserCog,
        "sidebar-academic-settings": LuSettings,
        "sidebar-registered-courses": FiBookOpen,
        "sidebar-logout": LuLogOut,
        "sidebar-releases": LuFileText,

        "sidebar-admin-faculties": LuLandmark,
        "sidebar-admin-departments": LuBuilding,
        "sidebar-admin-years": LuCalendar,
        "sidebar-admin-course-maps": LuMap,
        "sidebar-admin-users": LuUsers,
        "sidebar-admin-roles": LuShield,
        "sidebar-admin-courses": LuBookOpen,
        "sidebar-admin-materials": LuBookOpen,
        "sidebar-admin-grades": LuBadge,
        "sidebar-admin-tasks": LuClipboardList,
        "sidebar-admin-exams": LuListTodo,
        "sidebar-admin-announcements": LuMegaphone,
        "sidebar-admin-events": LuCalendarDays,
        "sidebar-admin-event-organizers": LuUsers,
        "sidebar-admin-roadmaps": LuMapPin,
        "sidebar-admin-study-maps": LuMap,
        "sidebar-admin-discussions": LuMessagesSquare,
        "sidebar-admin-logs": LuActivity,
        "sidebar-home": FiHome,
        "social-facebook": FaFacebook,
        "social-github": FaGithub,
        "social-linkedin": FaLinkedin,
        "social-linktree": FaLink,
        "social-website": FcGoogle,
        "badge-department": FaGraduationCap,
        "building-faculty": LuLandmark,
        "building-department": LuBuilding,
        "announcement-icon": LuMegaphone,
        "id-card-details": FaIdCard,
        "grades-icon": LuPaperclip,
        "exam-icon": LuListTodo,
        "activity-logs-icon": BsActivity,
        "certificate-year": FaGraduationCap,
        "materials-icon": LuBookOpen,
        "iconsax-calendar": LuCalendar,
        monitor: LuMonitor,
        "eye-review": LuEye,
        "pending-clock-new": LuClock,
        "call-details": LuPhone,
        "mail-details": LuMail,
        "arrow-up": FaArrowUp,
        "badge-faculty": LuFileText,
        "badge-id-card": FaIdCard,
        "badge-view": LuEye,
        "badge-year": FaScroll,
        note: FaRegNoteSticky,
        select: LuCircleCheck,
        "select-all": LuCircleCheck,
        share: LuShare2,
        copy: LuCopy,
        move: LuMove,
        edit: LuSquarePen,
        delete: LuTrash,
        close: LuX,
    };

    // Fallback to FiFileText if the icon key isn't found
    return iconMap[icon as string] || LuFileText;
};
