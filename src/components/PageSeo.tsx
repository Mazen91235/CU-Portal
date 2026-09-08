import { Helmet } from "react-helmet-async";
import Logo from "../assets/logo.png";
import LogoLight from "../assets/logo light.jpg";

const siteName = "CU Portal";
const defaultDescription =
  "Access your courses, tasks, exams, and announcements in one place.";

export const PageSeo = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const resolvedDescription = description ?? defaultDescription;
  const resolvedTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;
  const absoluteImageUrl = new URL(LogoLight, window.location.origin).href;
  const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <link href={Logo} rel="icon" />
      <link href={Logo} rel="shortcut icon" />
      <link href={Logo} rel="apple-touch-icon" />
      <link href={canonicalUrl} rel="canonical" />
      <meta name="description" content={resolvedDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
    </Helmet>
  );
};
