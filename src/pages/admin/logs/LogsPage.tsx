import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Table } from "../../../components/table/Table";
import useAuthQuery from "../../../hooks/useAuthQuery";
import {
    useLazyGetLogActionsQuery,
    useLazyGetLogEntitiesQuery,
    useLazyGetLogsQuery,
} from "../../../services/apis/admin/LogAPIs";
import type { LogResponseDto } from "../../../types/dtos/LogDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./LogsPage.module.css";

const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const getCodeClass = (code?: number | null) => {
    if (!code) return styles.codeDefault;
    if (code >= 500) return styles.code5xx;
    if (code >= 400) return styles.code4xx;
    if (code >= 300) return styles.code3xx;
    return styles.code2xx;
};

const getLevelClass = (level?: string | null) => {
    const normalizedLevel = level?.toLowerCase();
    if (normalizedLevel === "error") return styles.levelError;
    if (normalizedLevel === "warning") return styles.levelWarning;
    if (normalizedLevel === "info") return styles.levelInfo;
    return styles.levelDefault;
};

export const LogsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("user_id");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState(
        new Date().toLocaleDateString("en-CA"),
    );
    const [dateToFilter, setDateToFilter] = useState("");
    const [logs, setLogs] = useState<LogResponseDto[]>([]);
    const [getLogs] = useLazyGetLogsQuery();
    const [getLogActions] = useLazyGetLogActionsQuery();
    const [getLogEntities] = useLazyGetLogEntitiesQuery();
    const [actions, setActions] = useState<string[]>([]);
    const [entities, setEntities] = useState<string[]>([]);

    const fetchLogFilters = useCallback(async () => {
        try {
            const [actionsResult, entitiesResult] = await Promise.all([
                getLogActions().unwrap(),
                getLogEntities().unwrap(),
            ]);
            setActions(actionsResult.data || []);
            setEntities(entitiesResult.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getLogActions, getLogEntities]);

    useAuthQuery(fetchLogFilters);

    const fetchLogsData = useCallback(async () => {
        try {
            const logsResult = await getLogs({
                limit: 100,
                includes: ["user"],
                data: {
                    query: searchQuery.trim() || undefined,
                    action: actionFilter || undefined,
                    entity: entityFilter || undefined,
                    user_id: userId ? Number(userId) : undefined,
                    level: levelFilter || undefined,
                    created_at_from: dateFromFilter || undefined,
                    created_at_to: dateToFilter || undefined,
                },
                order_by: ["id"],
                descending: true,
            }).unwrap();
            setLogs(logsResult.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        actionFilter,
        dateFromFilter,
        dateToFilter,
        entityFilter,
        getLogs,
        levelFilter,
        searchQuery,
        userId,
    ]);

    const authQueryParams = useCallback(() => fetchLogsData(), [fetchLogsData]);

    useAuthQuery(authQueryParams);

    const actionOptions = useMemo(
        () => [
            { value: "", label: "All Actions" },
            ...actions.map((action) => ({ value: action, label: action })),
        ],
        [actions],
    );

    const entityOptions = useMemo(
        () => [
            { value: "", label: "All Entities" },
            ...entities.map((entity) => ({ value: entity, label: entity })),
        ],
        [entities],
    );

    const levelOptions = useMemo(
        () => [
            { value: "", label: "All Levels" },
            { value: "info", label: "Info" },
            { value: "warning", label: "Warning" },
            { value: "error", label: "Error" },
        ],
        [],
    );

    const tableData = useMemo(
        () =>
            logs.map((log) => ({
                data: [
                    log.id || "N/A",
                    log.action || "N/A",
                    log.entity || "N/A",
                    <span
                        className={`${styles.badge} ${getLevelClass(log.level)}`}
                    >
                        {log.level || "N/A"}
                    </span>,
                    <span
                        className={`${styles.badge} ${getCodeClass(log.response_code)}`}
                    >
                        {log.response_code || "N/A"}
                    </span>,
                    <span className={styles.userCell}>
                        {log.user?.name || "N/A"}
                    </span>,
                    formatDate(log.created_at),
                ],
                onClick: () => navigate(`/admin/logs/${log.id}`),
            })),
        [logs, navigate],
    );

    return (
        <Layout>
            <PageSeo
                title="System Logs - CU Portal"
                description="Review system activity logs and audit events"
            />
            <Banner
                title="System Logs"
                description="Review system activity and audit events"
            />
            <section className={styles.filtersSection}>
                <div className={styles.searchRow}>
                    <Search
                        placeholder="Search logs by action, entity, user or code..."
                        setValue={setSearchQuery}
                    />
                </div>
                <div className={styles.filtersRow}>
                    <SelectFilter
                        value={actionFilter}
                        setValue={setActionFilter}
                        options={actionOptions}
                    />
                    <SelectFilter
                        value={entityFilter}
                        setValue={setEntityFilter}
                        options={entityOptions}
                    />
                    <SelectFilter
                        value={levelFilter}
                        setValue={setLevelFilter}
                        options={levelOptions}
                    />
                    <DateFilter
                        placeholder="Date From"
                        setValue={setDateFromFilter}
                        defaultDate={dateFromFilter}
                    />
                    <DateFilter
                        placeholder="Date To"
                        setValue={setDateToFilter}
                    />
                </div>
            </section>
            <section className={styles.tableSection}>
                <Table
                    columns={[
                        "Id",
                        "Action",
                        "Entity",
                        "Level",
                        "Code",
                        "User",
                        "Date",
                    ]}
                    data={tableData}
                    action
                />
            </section>
        </Layout>
    );
};
