import { type ReactNode, isValidElement, cloneElement } from "react";

const linkStyle = {
  color: "var(--badge-early-access-bg)",
  textDecoration: "underline",
};

function linkifyString(text: string, keyPrefix: string): ReactNode {
  if (!text) return null;

  const urlRegex =
    /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s<]*)?)/g;

  const parts = text.split(urlRegex);

  return (
    <b key={keyPrefix} style={{ fontWeight: "normal" }}>
      {parts.map((part, index) => {
        const isUrl =
          /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s<]*)?$/.test(
            part,
          );

        if (isUrl) {
          const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;

          return (
            <a
              key={`${keyPrefix}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        return part;
      })}
    </b>
  );
}

export function linkify(node: ReactNode, keyPrefix = "lf"): ReactNode {
  if (typeof node === "string") {
    return linkifyString(node, keyPrefix);
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => linkify(child, `${keyPrefix}-${i}`));
  }

  if (isValidElement(node)) {
    const children = (node.props as { children?: ReactNode }).children;
    if (children === undefined) return node;
    return cloneElement(node, undefined, linkify(children, keyPrefix));
  }

  return node;
}
