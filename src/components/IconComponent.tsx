import type { Icon } from "../types/Icon";
import { GetIcon } from "../utils/LinkHandler";

export default function IconComponent({
    icon,
    size,
    className, 
    color 
}: { icon: Icon, size?: number | string, className?: string, color?: string })
    {
    const IconComponent = GetIcon(icon);
    return IconComponent ? <IconComponent size={size} className={className} color={color} /> : null;
}