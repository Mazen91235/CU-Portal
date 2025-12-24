import type { SearchDto } from "./SearchDTOs";

export type UsersDataResponseDto = {
    users_count?: number;
    users_this_month?: number;
    percentage_increase?: number;
    active_now?: number;
    pending_users_count?: number;
    last_five_users_active?: string[];
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
