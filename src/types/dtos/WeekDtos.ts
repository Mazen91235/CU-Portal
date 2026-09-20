import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { MaterialResponseDto } from "./MaterialDtos";
import type { SearchDto } from "./BaseDtos";

export type WeekCreateDto = {
    week_number: number;
    start_date: string;
    faculty_id: number;
    department_id: number;
    year_id: number;
};

export type WeekResponseDto = {
    id?: number | null;
    week_number?: number | null;
    start_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    materials?: MaterialResponseDto[] | null;
};

export type WeekUpdateDto = {
    week_number: number;
    start_date: string;
    faculty_id: number;
    department_id: number;
    year_id: number;
};

export type WeekSearchDto = {
    id?: number | null;
    week_number?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    start_date_from?: string | null;
    start_date_to?: string | null;
    start_date_includes?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
