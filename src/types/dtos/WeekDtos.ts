import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { MaterialResponseDto } from "./MaterialDtos";
import type { SearchDto } from "./BaseDtos";

export type WeekCreateDto = {
    week_number: number;
    start_date: Date;
    faculty_id: number;
    department_id: number;
    year_id: number;
};

export type WeekResponseDto = {
    id?: number | null;
    week_number?: number | null;
    start_date?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    materials?: MaterialResponseDto[] | null;
};

export type WeekUpdateDto = {
    week_number: number;
    start_date: Date;
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
    start_date_from?: Date | null;
    start_date_to?: Date | null;
    start_date_includes?: Date | null;
    created_at_from?: Date | null;
    created_at_to?: Date | null;
    updated_at_from?: Date | null;
    updated_at_to?: Date | null;
} & SearchDto;
