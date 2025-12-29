export type ToastProps = {
    toast: {
        id: string;
        type: "success" | "error";
        title: string;
        message: string;
    };
    onRemove: (id: string) => void;
};

export type ToastData = ToastProps["toast"];

export type ToastContainerProps = {
    toast: ToastData | null;
    onRemove: () => void;
};

export type ToastListener = (toast: ToastData) => void;
