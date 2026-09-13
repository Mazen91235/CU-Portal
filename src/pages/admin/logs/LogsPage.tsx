import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Table } from "../../../components/table/Table";
import { staticLogs } from "./logData";
import styles from "./LogsPage.module.css";

const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
};

const getCodeClass = (code?: number | null) => {
    if (!code) return styles.codeDefault;
    if (code >= 500) return styles.code5xx;
    if (code >= 400) return styles.code4xx;
    if (code >= 300) return styles.code3xx;
    return styles.code2xx;
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

    const actionOptions = useMemo(() => [
        { value: "", label: "All Actions" },
        ...Array.from(new Set(staticLogs.map((log) => log.action))).map((action) => ({ value: action || "", label: action || "" })),
    ], []);

    const entityOptions = useMemo(() => [
        { value: "", label: "All Entities" },
        ...Array.from(new Set(staticLogs.map((log) => log.entity))).map((entity) => ({ value: entity || "", label: entity || "" })),
    ], []);

    const levelOptions = useMemo(() => [
        { value: "", label: "All Levels" },
        { value: "Info", label: "Info" },
        { value: "Warning", label: "Warning" },
        { value: "Error", label: "Error" },
    ], []);

    const filteredLogs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return staticLogs.filter((log) => {
            const createdAt = log.created_at?.slice(0, 10) || "";
            const matchesUser = !userId || String(log.user?.id) === userId;
            const matchesQuery = !query || [log.id, log.action, log.entity, log.level, log.response_code, log.user?.name].join(" ").toLowerCase().includes(query);
            return matchesUser && matchesQuery && (!actionFilter || log.action === actionFilter) && (!entityFilter || log.entity === entityFilter) && (!levelFilter || log.level === levelFilter) && (!dateFromFilter || createdAt >= dateFromFilter) && (!dateToFilter || createdAt <= dateToFilter);
        });
    }, [actionFilter, dateFromFilter, dateToFilter, entityFilter, levelFilter, searchQuery, userId]);

    const tableData = useMemo(() => filteredLogs.map((log) => ({
        data: [
            log.id || "N/A",
            log.action || "N/A",
            log.entity || "N/A",
            <span className={`${styles.badge} ${styles[`level${log.level}`] || styles.levelDefault}`}>{log.level || "N/A"}</span>,
            <span className={`${styles.badge} ${getCodeClass(log.response_code)}`}>{log.response_code || "N/A"}</span>,
            <span className={styles.userCell}>{log.user?.name || "System"}</span>,
            formatDate(log.created_at),
        ],
        onClick: () => navigate(`/admin/logs/${log.id}`),
    })), [filteredLogs, navigate]);

    return (
        <Layout>
            <PageSeo title="System Logs - CU Portal" description="Review system activity logs and audit events" />
            <Banner title="System Logs" description="Review system activity and audit events" />
            <section className={styles.filtersSection}>
                <div className={styles.searchRow}>
                    <Search placeholder="Search logs by action, entity, user or code..." setValue={setSearchQuery} />
                </div>
                <div className={styles.filtersRow}>
                    <SelectFilter value={actionFilter} setValue={setActionFilter} options={actionOptions} />
                    <SelectFilter value={entityFilter} setValue={setEntityFilter} options={entityOptions} />
                    <SelectFilter value={levelFilter} setValue={setLevelFilter} options={levelOptions} />
                    <DateFilter placeholder="Date From" setValue={setDateFromFilter} defaultDate={dateFromFilter} />
                    <DateFilter placeholder="Date To" setValue={setDateToFilter} />
                </div>
            </section>
            <section className={styles.tableSection}>
                <Table columns={["Id", "Action", "Entity", "Level", "Code", "User", "Date"]} data={tableData} action />
            </section>
        </Layout>
    );
};