export type GenericAPIResponse<T = null> = {
    status: "success" | "error";
    message: string;
    data?: T | null;
    next?: boolean; 
};

export type DefaultAPIResponse<T = null> = {
    status: number;
    data: GenericAPIResponse<T>;
};
