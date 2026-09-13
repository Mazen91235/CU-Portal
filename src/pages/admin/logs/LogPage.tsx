import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import { UserCard } from "../../../components/user/UserCard";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useLazyGetLogQuery } from "../../../services/apis/admin/LogAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import type { LogResponseDto } from "../../../types/dtos/LogDtos";
import { formatDateTime } from "../../../utils/Formatter";
import styles from "./LogPage.module.css";

const getLevelClass = (level?: string | null) => {
    const normalizedLevel = level?.toLowerCase();
    if (normalizedLevel === "error") return styles.levelError;
    if (normalizedLevel === "warning") return styles.levelWarning;
    if (normalizedLevel === "info") return styles.levelInfo;
    return styles.levelDefault;
};

export const LogPage = () => {
    const { logId } = useParams<{ logId: string }>();
    const navigate = useNavigate();
    const [getLog] = useLazyGetLogQuery();
    const [log, setLog] = useState<LogResponseDto | null>(null);

    const fetchLog = useCallback(async () => {
        if (!logId) {
            navigate("/admin/logs");
            return;
        }
        try {
            const result = await getLog({ log_id: Number(logId) }).unwrap();
            if (result.data) setLog(result.data);
            else navigate("/admin/logs");
        } catch (error) {
            handlePopupErrors(error);
            navigate("/admin/logs");
        }
    }, [getLog, logId, navigate]);

    const authQueryParams = useCallback(() => fetchLog(), [fetchLog]);

    useAuthQuery(authQueryParams);

    if (!log) return null;

    return (
        <Layout>
            <PageSeo
                title={`Log #${log.id} - CU Portal`}
                description={`View details for log ${log.id}`}
            />
            <SubBanner
                title={`Log #${log.id}`}
                description={log.action || "Log details"}
                icon="activity-logs-icon"
                linkText="Back to Logs"
                linkTo="/admin/logs"
            />
            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Action"
                        value={log.action || "N/A"}
                        icon="tag"
                    />
                    <StatCard
                        type="Entity"
                        value={log.entity || "N/A"}
                        icon="book"
                    />
                    <StatCard
                        type="Level"
                        value={
                            <span
                                className={`${styles.levelBadge} ${getLevelClass(log.level)}`}
                            >
                                {log.level || "N/A"}
                            </span>
                        }
                        icon="warning-circle"
                    />
                    <StatCard
                        type="Created At"
                        value={formatDateTime(log.created_at) || "N/A"}
                        icon="calendar"
                    />
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainContent}>
                        <LongSection title="Log Message" icon="align-left">
                            <p className={styles.message}>
                                {log.message || "No message available"}
                            </p>
                        </LongSection>
                        <LongSection title="Log Details" icon="code">
                            <div className={styles.jsonContainer}>
                                <pre className={styles.jsonContent}>
                                    {JSON.stringify(log.details || {}, null, 2)}
                                </pre>
                            </div>
                        </LongSection>
                    </div>

                    <aside className={styles.sidebar}>
                        {log.user && <UserCard user={log.user} button />}
                        <QuickInfoSection
                            items={[
                                { label: "Route:", value: log.route || "N/A" },
                                {
                                    label: "IP Address:",
                                    value: log.ip || "N/A",
                                },
                                {
                                    label: "Created At:",
                                    value:
                                        formatDateTime(log.created_at) || "N/A",
                                },
                            ]}
                        />
                    </aside>
                </div>
            </div>
        </Layout>
    );
};
