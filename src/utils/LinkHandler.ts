import { type Icon } from "../types/Icon";
import type { IconType } from "react-icons";
import DefaultAvatar from "../assets/default avatar.png";

// --- React Icons Imports ---
import {
    FaRegBuilding, FaRegCalendarAlt, FaGraduationCap, FaUniversity,
    FaFacebook, FaGithub, FaLinkedin, FaLink, FaGlobe, FaSpinner,
    FaScroll,
    FaIdCard,
    FaRegIdCard,
    FaArrowUp,
} from "react-icons/fa";
import {
    MdOutlineAnnouncement, MdOutlineMenuBook, MdOutlineEventNote,
    MdGrade, MdOutlineTrackChanges, MdOutlineDashboardCustomize
} from "react-icons/md";
import {
    FiDownload, FiShield, FiMapPin, FiMenu, FiBell, FiTarget,
    FiCheckSquare, FiClock, FiCheckCircle, FiAlertCircle, FiChevronDown,
    FiHome, FiMap, FiFolder, FiFolderPlus, FiFileText, FiSettings,
    FiBookOpen, FiLogOut, FiUsers, FiUser, FiActivity, FiBarChart2, FiHexagon,
    FiEye,
    FiPaperclip,
    FiMail,
    FiPhone,
    FiMonitor,
} from "react-icons/fi";
import { BsActivity, BsChatDots, BsJournalBookmark } from "react-icons/bs";
import { PiExam } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { BiTrendingUp } from "react-icons/bi";

const apiDomain = "https://api.cu-portal.com";
const version = "v1";
export const GetUserApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/${version}/user/${path}`;
};

export const GetAdminApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/${version}/admin/${path}`;
};

export const GetApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${apiDomain}/${version}/${path}`;
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

export const GetIcon = (icon: Icon): IconType => {
    const iconMap: Record<Icon, IconType> = {
        announcements: MdOutlineAnnouncement,
        building: FaRegBuilding,
        calendar: FaRegCalendarAlt,
        chat: BsChatDots,
        course: MdOutlineMenuBook,
        "dashboard-personalize": MdOutlineDashboardCustomize,
        download: FiDownload,
        events: MdOutlineEventNote,
        google: FcGoogle,
        "google-logo": FcGoogle,
        hat: FaGraduationCap,
        "book-saved": BsJournalBookmark,
        "status-up": BiTrendingUp,
        user: FiUser,
        "users-assigned": FiUsers,
        permissions: FiShield,
        location: FiMapPin,
        logo: FiHexagon,
        menu: FiMenu,
        notification: FiBell,
        subject: FiBookOpen,
        target: FiTarget,
        task: FiCheckSquare,
        time: FiClock,
        tracker: MdOutlineTrackChanges,
        verify: FiCheckCircle,
        "warning-circle": FiAlertCircle,
        "spinner-ellipse-11": FaSpinner,
        "spinner-ellipse-12": FaSpinner,
        "spinner-ellipse-13": FaSpinner,
        "spinner-ellipse-14": FaSpinner,
        "spinner-ellipse-15": FaSpinner,
        "spinner-ellipse-16": FaSpinner,
        "sidebar-dropdown": FiChevronDown,
        "sidebar-home": FiHome,
        "sidebar-courses": MdOutlineMenuBook,
        "sidebar-coursemap": FiMap,
        "sidebar-calendar": FaRegCalendarAlt,
        "sidebar-tasks": FiCheckSquare,
        "sidebar-exams": PiExam,
        "sidebar-announcements": MdOutlineAnnouncement,
        "sidebar-materials": FiFolder,
        "sidebar-other-materials": FiFolderPlus,
        "sidebar-grades": MdGrade,
        "sidebar-study-tracker": MdOutlineTrackChanges,
        "sidebar-events": MdOutlineEventNote,
        "sidebar-cv-generator": FiFileText,
        "sidebar-roadmaps": FiMap,
        "sidebar-discussion": BsChatDots,
        "sidebar-profile-settings": FiSettings,
        "sidebar-academic-settings": FiSettings,
        "sidebar-registered-courses": FiBookOpen,
        "sidebar-logout": FiLogOut,
        "sidebar-admin-dashboard": FiHome,
        "sidebar-admin-faculties": FaUniversity,
        "sidebar-admin-departments": FaRegBuilding,
        "sidebar-admin-years": FaRegCalendarAlt,
        "sidebar-admin-course-maps": FiMap,
        "sidebar-admin-users": FiUsers,
        "sidebar-admin-roles": FiShield,
        "sidebar-admin-courses": MdOutlineMenuBook,
        "sidebar-admin-materials": FiFolder,
        "sidebar-admin-grades": MdGrade,
        "sidebar-admin-tasks": FiCheckSquare,
        "sidebar-admin-exams": PiExam,
        "sidebar-admin-announcements": MdOutlineAnnouncement,
        "sidebar-admin-logs": FiActivity,
        "sidebar-admin-roadmaps": FiMap,
        "sidebar-admin-study-maps": FiMap,
        "sidebar-admin-study-analysis": FiBarChart2,
        "sidebar-admin-events": MdOutlineEventNote,
        "sidebar-admin-discussions": BsChatDots,
        "social-facebook": FaFacebook,
        "social-github": FaGithub,
        "social-linkedin": FaLinkedin,
        "social-linktree": FaLink,
        "social-website": FaGlobe,
        "badge-department": FaGraduationCap,
        "badge-faculty": FiFileText,
        "badge-id-card": FaIdCard,
        "badge-view": FiEye,
        "badge-year": FaScroll,
        "call-details": FiPhone,
        "user-details": FiUser,
        "mail-details": FiMail,
        "arrow-up": FaArrowUp,
        "building-faculty": FaRegBuilding,
        "building-department": FaRegBuilding,
        "announcement-icon": MdOutlineAnnouncement,
        "subjects-icon": FiBookOpen,
        "task-details-icon": FiFileText,
        "id-card-details": FaRegIdCard,
        "grades-icon": FiPaperclip,
        "exam-icon": PiExam,
        "activity-logs-icon": BsActivity,
        "certificate-year": FaGraduationCap,
        "materials-icon": BsJournalBookmark,
        "iconsax-calendar": FaRegCalendarAlt,
        monitor: FiMonitor,
        "eye-review": FiEye,
        "users-total": FiUsers,
        "pending-clock-new": FiClock,
    };

    return iconMap[icon];
};
