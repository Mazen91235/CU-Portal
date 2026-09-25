import type {
    ReleaseResponseDto,
    ReleaseSearchDto,
} from "../types/dtos/ReleaseDtos";
import type { QueryModel } from "../types/models/QueryModel";

export const LATEST_RELEASE_STORAGE_KEY = "latest-release";
export const LATEST_RELEASE_CACHE_DURATION = 120;

export type LatestReleaseCache = {
    release: ReleaseResponseDto;
    last_fetched: number;
};

const isReleaseResponse = (value: unknown): value is ReleaseResponseDto =>
    !!value && typeof value === "object";

const isLatestReleaseCache = (value: unknown): value is LatestReleaseCache => {
    if (!value || typeof value !== "object") return false;

    const cache = value as Partial<LatestReleaseCache>;
    return (
        typeof cache.last_fetched === "number" &&
        isReleaseResponse(cache.release)
    );
};

export const readLatestReleaseCache = (): LatestReleaseCache | null => {
    try {
        const stored = localStorage.getItem(LATEST_RELEASE_STORAGE_KEY);
        if (!stored) return null;

        const parsed: unknown = JSON.parse(stored);
        if (!isLatestReleaseCache(parsed)) {
            localStorage.removeItem(LATEST_RELEASE_STORAGE_KEY);
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem(LATEST_RELEASE_STORAGE_KEY);
        return null;
    }
};

export const writeLatestReleaseCache = (
    release: ReleaseResponseDto,
    lastFetched = Date.now(),
) => {
    localStorage.setItem(
        LATEST_RELEASE_STORAGE_KEY,
        JSON.stringify({ release, last_fetched: lastFetched }),
    );
};

const getReleaseTimestamp = (release?: ReleaseResponseDto | null) => {
    if (!release?.date) return null;

    const timestamp = new Date(release.date).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
};

export const isReleaseLater = (
    candidate?: ReleaseResponseDto | null,
    current?: ReleaseResponseDto | null,
) => {
    const candidateDate = getReleaseTimestamp(candidate);
    const currentDate = getReleaseTimestamp(current);

    if (candidateDate == null) return false;
    if (currentDate == null) return true;

    return candidateDate > currentDate;
};

export const isReleaseAtLeastAsRecent = (
    candidate?: ReleaseResponseDto | null,
    current?: ReleaseResponseDto | null,
) => {
    const candidateDate = getReleaseTimestamp(candidate);
    const currentDate = getReleaseTimestamp(current);

    if (candidateDate == null) return false;
    if (currentDate == null) return true;

    return candidateDate >= currentDate;
};

const hasEmptyReleaseSearchData = (query?: ReleaseSearchDto | null) => {
    if (!query) return true;

    return Object.values(query).every((value) => value == null || value === "");
};

export const isLatestReleaseQuery = (
    query?: QueryModel<ReleaseSearchDto> | null,
) => {
    const orderBy = query?.order_by;

    return (
        hasEmptyReleaseSearchData(query?.data) &&
        query?.descending === true &&
        orderBy?.length === 1 &&
        orderBy[0].includes("date")
    );
};

export const getLatestReleaseCandidate = (
    releases: ReleaseResponseDto[],
    latestReleaseQuery: boolean,
) => {
    if (releases.length === 0) return null;
    if (latestReleaseQuery) return releases[0];

    return releases.reduce<ReleaseResponseDto | null>(
        (latest, release) =>
            !latest || isReleaseLater(release, latest) ? release : latest,
        null,
    );
};
