import { Helmet } from "react-helmet-async";
import Logo from "../assets/logo.png";
import LogoLight from "../assets/logo light.jpg";

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
            <link href={Logo} rel="icon" />
            <link href={Logo} rel="shortcut icon" />
            <link href={Logo} rel="favicon" />
            <link href={Logo} rel="apple-touch-icon" />
            <meta property="og:image" content={LogoLight} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description ?? ""} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="CU - Portal" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description ?? ""} />
            <meta name="twitter:image" content={LogoLight} />
        </Helmet>
    );
};
