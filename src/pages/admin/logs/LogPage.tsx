import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ReactJson from "react-json-view";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import { Avatar } from "../../../components/avatar/Avatar";
import type { LogResponseDto } from "../../../types/dtos/LogDtos";
import { captitalize, formatDateTime } from "../../../utils/Formatter";
import { staticLogs } from "./logData";
import emailIcon from "../../../assets/icons/email.svg";
import phoneIcon from "../../../assets/icons/phone.svg";
import styles from "./LogPage.module.css";

const getLevelClass = (level?: string | null) => {
    if (level === "Error") return styles.levelError;
    if (level === "Warning") return styles.levelWarning;
    return styles.levelInfo;
};

const UserCard = ({
    user,
}: {
    user: NonNullable<LogResponseDto["user"]>;
}) => (
    <div className={styles["user-card"]}>
        <div className={styles["user-card-header"]}>
            <span className={styles["user-role"]}>
                {captitalize(user.role?.name || undefined)}
            </span>
        </div>
        <Avatar
            user={user}
            size="large"
            className={styles["user-avatar"]}
        />
        <h3 className={styles["user-name"]}>{user.name}</h3>
        <div className={styles["user-academic-details"]}>
            <div>
                <span>Faculty</span>
                <span>{user.faculty?.name || "N/A"}</span>
            </div>
            <div className={styles["separator"]}></div>
            <div>
                <span>Department</span>
                <span>{user.department?.name || "N/A"}</span>
            </div>
            <div className={styles["separator"]}></div>
            <div>
                <span>Year</span>
                <span>{user.year?.year || "N/A"}</span>
            </div>
        </div>
        <div className={styles["user-details"]}>
            <h5>
                <img src={emailIcon} alt="Email" />
                <span>{user.email}</span>
            </h5>
            <h5>
                <img src={phoneIcon} alt="Phone" />
                <span>{user.phone || "N/A"}</span>
            </h5>
        </div>
        <button className={styles["view-profile-button"]}>
            <Link to={`/admin/users/${user.id}`} className={styles.userLink}>
                View user profile
            </Link>
        </button>
    </div>
);

export const LogPage = () => {
    const { logId } = useParams<{ logId: string }>();
    const navigate = useNavigate();
    const log = staticLogs.find((item) => String(item.id) === logId);

    useEffect(() => {
        if (!log) navigate("/admin/logs");
    }, [log, navigate]);

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
                    <StatCard type="Action" value={log.action || "N/A"} icon="tag" />
                    <StatCard type="Entity" value={log.entity || "N/A"} icon="book" />
                    <StatCard
                        type="Level"
                        value={
                            <span className={`${styles.levelBadge} ${getLevelClass(log.level)}`}>
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
                                <ReactJson 
                                    src={log.details || {}} 
                                    theme="twilight" 
                                    collapsed={2} 
                                    displayDataTypes={false} 
                                    enableClipboard={false} 
                                    style={{ padding: '1rem', background: 'transparent' }} 
                                />
                            </div>
                        </LongSection>
                    </div>

                    <aside className={styles.sidebar}>
                        {log.user && <UserCard user={log.user} />}
                        <QuickInfoSection
                            items={[
                                { label: "Route:", value: log.route || "N/A" },
                                { label: "IP Address:", value: log.ip || "N/A" },
                                {
                                    label: "Created At:",
                                    value: formatDateTime(log.created_at) || "N/A",
                                },
                            ]}
                        />
                    </aside>
                </div>
            </div>
        </Layout>
    );
};