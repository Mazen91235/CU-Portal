import eyeIcon from "../../assets/icons/eye.png";
import styles from "./Table.module.css";

type TableProps = {
    columns: string[];
    data: {
        data: (string | number | React.ReactElement)[];
        onClick: () => void;
    }[];
    action?: boolean;
};

export const Table = ({ columns, data, action = false }: TableProps) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>{column}</th>
                        ))}
                        {action && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={
                                    action ? columns.length + 1 : columns.length
                                }
                                style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                }}
                            >
                                No data found
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.data.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                                {action && (
                                    <td>
                                        <span
                                            className={styles.tableAction}
                                            onClick={row.onClick}
                                        >
                                            <img src={eyeIcon} alt="View" />
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
