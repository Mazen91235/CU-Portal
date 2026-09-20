import { Helmet } from "react-helmet-async";

export const PageSeo = ({
    title,
    description,
}: {
    title: string;
    description?: string;
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description ?? ""} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description ?? ""} />
            <meta property="og:url" content={window.location.href} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description ?? ""} />
            <meta property="twitter:url" content={window.location.href} />
        </Helmet>
    );
};
