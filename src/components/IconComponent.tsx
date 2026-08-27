import type { Icon } from "../types/Icon";
import { GetIcon } from "../utils/LinkHandler";

export default function IconComponent({
    icon,
    size,
    className,
    color,
    style,
}: {
    icon: Icon;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
}) {
    const IconComponent = GetIcon(icon);
    return IconComponent ? (
        <IconComponent
            size={size}
            className={className}
            color={color}
            style={style}
        />
    ) : null;
}
