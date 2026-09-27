import { useCallback, useRef, useState } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

export const LoadingProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const loadingTokensRef = useRef<Set<number>>(new Set());
    const nextTokenRef = useRef(0);
    const [loading, setLoading] = useState(false);

    const startLoading = useCallback(() => {
        const token = nextTokenRef.current++;
        loadingTokensRef.current.add(token);
        setLoading(true);

        let released = false;

        return () => {
            if (released) return;
            released = true;

            loadingTokensRef.current.delete(token);
            setLoading(loadingTokensRef.current.size > 0);
        };
    }, []);

    return (
        <LoadingContext value={{ loading, startLoading }}>
            {children}
        </LoadingContext>
    );
};
