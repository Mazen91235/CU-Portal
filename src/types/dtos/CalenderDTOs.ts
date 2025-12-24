import type { SearchDto } from "./SearchDTOs";

export type CalenderSearchDto =  {
                month: number;
                year: number;
            } & SearchDto;
