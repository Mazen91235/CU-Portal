import type { UserStudyType } from "../entities/User";
import type { YearResponseDto } from "./YearDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { RoleResponseDto } from "./RoleDtos";
import type { PendingUserResponseDto } from "./PendingUserDtos";
import type { MaterialResponseDto } from "./MaterialDtos";
import type { TaskResponseDto } from "./TaskDtos";
import type { ExamResponseDto } from "./ExamDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { NotificationResponseDto } from "./NotificationDtos";
import type { LogResponseDto } from "./LogDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { SearchDto } from "./BaseDtos";
import type { Note } from "../entities/Note";

export type UserCreateDto = {
    name: string;
    email: string;
    phone: string;
    gender: string;
    url?: string | null;
    is_early_access: boolean;
    agreed: boolean;
    google_details_token: string;
    details?: object;
};

export type UserResponseDto = {
    id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    gender?: string | null;
    study_type?: UserStudyType | null;
    section?: number | null;
    status?: boolean | null;
    is_early_access?: boolean | null;
    manages?: object | null;
    details?: {
        avatar?: string | null;
    };
    google_id?: string | null;
    google_name?: string | null;
    google_email?: string | null;
    google_avatar?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    year?: YearResponseDto | null;
    department?: DepartmentResponseDto | null;
    faculty?: FacultyResponseDto | null;
    role?: RoleResponseDto | null;
    pending_user?: PendingUserResponseDto | null;
    materials?: MaterialResponseDto[] | null;
    tasks?: TaskResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
    notifications?: NotificationResponseDto[] | null;
    logs?: LogResponseDto[] | null;
    subjects?: SubjectResponseDto[] | null;
    notes?: Note[] | null;
    level?: number | null;
    canAccessAll?: boolean | null;
};

export type UserUpdateDto = {
    name: string;
    details?: {
        avatar?: string | null;
    };
};

export type UserSearchDto = {
    id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    status?: boolean | null;
    refresh_token?: string | null;
    refresh_expire_at_from?: string | null;
    refresh_expire_at_to?: string | null;
} & SearchDto;

export type UserGetUserWithDetailsDto = {
    id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: boolean | null;
    gender?: string | null;
    section?: number | null;
    is_early_access?: boolean | null;
    details?: object | null;
    google_id?: string | null;
    google_name?: string | null;
    google_email?: string | null;
    google_avatar?: string | null;
    study_type?: UserStudyType | null;
    created_at?: string | null;
    updated_at?: string | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    role?: RoleResponseDto | null;
    tasks_published?: TaskResponseDto[] | null;
    tasks?: TaskResponseDto[] | null;
    exams_published?: ExamResponseDto[] | null;
    exams?: ExamResponseDto[] | null;
    announcements_published?: AnnouncementResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
    materials?: MaterialResponseDto[] | null;
    subjects?: SubjectResponseDto[] | null;
    logs?: LogResponseDto[] | null;
};

export type UserSignUpResponseDto = {
    token: string;
};

export type UserVerifyEmailDto = {
    token: string;
};

export type UserGetStoredAccessTokenDto = {
    google_details_token: string;
    oauth_state: string;
};

export type UserLoginWithGoogleResponseDto = {
    redirect_response_url: string;
    state: string;
    nonce: string;
};

export type UserLoginResponseDto = {
    user?: UserResponseDto | null;
    token?: string | null;
    state?: string | null;
    token_expiration?: number | null;
    redirect_url?: string | null;
};

export type UserTokenDetailsResponseDto = {
    name: string;
    email: string;
    can_resend_after?: number | null;
};

export type UserResendTokenResponseDto = {
    token: string;
};

export type UserUpdateUsersRecordDto = {
    id: number;
    approved: boolean;
    role_id?: number | null;
};

export type UserUpdateUsersDto = {
    data_to_update: UserUpdateUsersRecordDto[];
};

export type UserHasPermissionsDto = {
    required_permissions: string[];
    is_and: boolean;
};

export type UserUpdateAcademicDataDto = {
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    study_type?: UserStudyType | null;
};

export type UserStatisticsResponseDto = {
    users_count: number;
    users_this_month_count: number;
    percentage_increase: number;
    active_now_count: number;
    pending_users_count: number;
    last_five_users_active: string[];
};
