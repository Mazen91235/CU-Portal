import logoImage from "../../assets/logo.png";
import styles from "./Logo.module.css";

const Logo = ({
    width = 60,
    height = 60,
    onClick,
}: {
    width?: number;
    height?: number;
    onClick?: () => void;
}) => {
    if (!onClick) {
        onClick = () => {
            const location = window.location.href;
            if (location.includes("/user")) window.location.href = "/user";
            else if (location.includes("/admin"))
                // window.location.href = "/admin";
                window.location.href = "/user";
            else window.location.href = "/";
        };
    }
    return (
        <img
            src={logoImage}
            alt="CU Portal Logo"
            width={width}
            height={height}
            className={styles.logoImage}
            onClick={onClick}
        />
    );
};

export default Logo;
