import styles from "./OtherMaterialsScopeHeader.module.css";

type OtherMaterialsScopeHeaderProps = {
    departmentName?: string | null;
    yearName?: string | null;
    onChangeDepartment: () => void;
    onChangeYear?: () => void;
};

export function OtherMaterialsScopeHeader({
    departmentName,
    yearName,
    onChangeDepartment,
    onChangeYear,
}: OtherMaterialsScopeHeaderProps) {
    return (
        <div className={styles.scopeHeader}>
            <span className={styles.label}>Browsing:</span>
            <button className={styles.scopeItem} onClick={onChangeDepartment}>
                {departmentName || "Department"}
            </button>
            {yearName && (
                <>
                    <span className={styles.separator}>/</span>
                    {onChangeYear ? (
                        <button
                            className={styles.scopeItem}
                            onClick={onChangeYear}
                        >
                            {yearName}
                        </button>
                    ) : (
                        <span className={styles.scopeItemStatic}>
                            {yearName}
                        </span>
                    )}
                </>
            )}
        </div>
    );
}

export default OtherMaterialsScopeHeader;
