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
