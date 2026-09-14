import styles from "./OtherMaterialsScopeHeader.module.css";

type OtherMaterialsScopeHeaderProps = {
    studyTypeName?: string | null;
    departmentName?: string | null;
    yearName?: string | null;
    onChangeHome: () => void;
    onChangeStudyType?: () => void;
    onChangeDepartment?: () => void;
};

export function OtherMaterialsScopeHeader({
    studyTypeName,
    departmentName,
    yearName,
    onChangeHome,
    onChangeStudyType,
    onChangeDepartment,
}: OtherMaterialsScopeHeaderProps) {
    return (
        <div className={styles.scopeHeader}>
            <span className={styles.label}>Browsing:</span>
            <button className={styles.scopeItem} onClick={onChangeHome}>
                Home
            </button>
            {studyTypeName && onChangeStudyType && (
                <button
                    className={styles.scopeItem}
                    onClick={onChangeStudyType}
                >
                    {studyTypeName}
                </button>
            )}
            {onChangeDepartment ? (
                <button
                    className={styles.scopeItem}
                    onClick={onChangeDepartment}
                >
                    {departmentName || "Department"}
                </button>
            ) : (
                <span className={styles.scopeItemStatic}>
                    {departmentName || "Department"}
                </span>
            )}
            {yearName && (
                <span className={styles.scopeItemStatic}>{yearName}</span>
            )}
        </div>
    );
}

export default OtherMaterialsScopeHeader;
