import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { PendingUser } from "./PendingUser";
import type { Role } from "./Role";
import type { Year } from "./Year";

export type User = {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    national_id?: string;
    gender?: string;
    type?: string;
    year?: Year | null;
    year_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    section?: number | null;
    status?: boolean;
    is_early_access?: boolean;
    role?: Role | null;
    role_id?: number | null;
    manages?: object;
    details?: {
        avatar?: string | null;
    };
    google_id?: string | null;
    google_name?: string | null;
    google_email?: string | null;
    google_avatar?: string | null;
    google_refresh_token?: string | null;
    ips?: string[];
    refresh_token?: string | null;
    refresh_expire_at?: string | null;
    pending_user?: PendingUser | null;
    user_id?: number | null;
    notifications_count?: number;
    enrolled_courses_count?: number;
    created_at?: string | null;
    modified_at?: string | null;
    // user level for progress
    level?: number;
};
