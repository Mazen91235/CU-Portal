import type { Announcement } from "../entities/Announcement";
import type { Grade } from "../entities/Grade";
import type { Log } from "../entities/Log";
import type { Material } from "../entities/Material";
import type { Subject } from "../entities/Subject";
import type { Task } from "../entities/Task";
import type { User } from "../entities/User";
import type { SearchDto } from "./SearchDTOs";

export type UsersDataResponseDto = {
    users_count?: number;
    users_this_month?: number;
    percentage_increase?: number;
    active_now?: number;
    pending_users_count?: number;
    deleted_users_count?: number;
    deleted_percentage_increase?: number;
    last_five_users_active?: string[];
};

export type UserResponseDto = User & {
    exams_published?: Task[];
    exams?: Task[];
    tasks_published?: Task[];
    tasks?: Task[];
    announcements_published?: Announcement[];
    materials_uploaded?: Material[];
    grades_uploaded?: Grade[];
    subjects?: Subject[];
    logs?: Log[];
};

export type UsersUpdateDto = {
    data_to_update: {
        id?: number;
        approved?: boolean;
        role_id?: number;
    }[];
};

export type UserSearchDto = {
    faculty_id?: number;
    department_id?: number;
    year_id?: number;
    is_active?: boolean;
} & SearchDto;
