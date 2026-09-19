import { useState, useEffect } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  Path,
  UseFormSetValue,
} from "react-hook-form";
import { showToast } from "../../utils/ToastsManager";
import type { LinkData } from "../../types/entities/Task";
import styles from "./LinksInputContainer.module.css";

export type LinkDataWithExisting = LinkData & { isExisting?: boolean };

const UNTITLED_LINK_TITLE = "Untitled Link";

export const LinksInputContainer = <T extends Record<string, unknown>>({
  register,
  name,
  errors,
  setValue,
  defaultValue,
  existingLinks,
  setExistingLinks,
  disabled,
  linkTitleOptions,
}: {
  register: UseFormRegister<T>;
  name: Path<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  defaultValue?: string;
  existingLinks?: LinkDataWithExisting[];
  setExistingLinks?: (links: LinkDataWithExisting[]) => void;
  disabled?: boolean;
  linkTitleOptions?: string[];
}) => {
  const [links, setLinks] = useState<LinkDataWithExisting[]>([
    { title: "", url: "" },
  ]);
  const [existingLinksList, setExistingLinksList] = useState<
    LinkDataWithExisting[]
  >(existingLinks || []);

  useEffect(() => {
    if (existingLinks) {
      setExistingLinksList(existingLinks);
    }
  }, [existingLinks]);

  useEffect(() => {
    if (defaultValue) {
      const parsedLinks = parseLinksString(defaultValue);
      if (parsedLinks.length > 0) {
        setLinks(parsedLinks);
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    const formattedString = formatLinksString(existingLinksList, links);
    // @ts-expect-error - String type is correct but doesn't match generic form type
    setValue(name, formattedString);
  }, [existingLinksList, links, name, setValue]);

  const parseLinksString = (linksString: string): LinkDataWithExisting[] => {
    if (!linksString || linksString.trim() === "") {
      return [{ title: "", url: "" }];
    }

    return linksString
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const separatorIndex = pair.indexOf("|");
        if (separatorIndex === -1) {
          return { title: "", url: pair };
        }

        return {
          title: pair.slice(0, separatorIndex).trim(),
          url: pair.slice(separatorIndex + 1).trim(),
        };
      });
  };

  const formatLinksString = (
    existing: LinkDataWithExisting[],
    current: LinkDataWithExisting[],
  ): string => {
    const allLinks = [...existing, ...current].filter(
      (link) => link.url.trim() !== "",
    );

    return allLinks
      .map(
        (link) =>
          `${link.title.trim() || UNTITLED_LINK_TITLE}|${link.url.trim()}`,
      )
      .join(", ");
  };

  const addLink = () => {
    if (disabled) return;
    if (
      links.some((link) => link.title.trim() === "" || link.url.trim() === "")
    ) {
      showToast(
        "error",
        "Error",
        "Please fill in all link fields before adding a new one.",
      );
      return;
    }
    setLinks([...links, { title: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    if (disabled) return;
    if (links.length === 1) {
      setLinks([{ title: "", url: "" }]);
    } else {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateExistingLink = (
    index: number,
    field: "title" | "url",
    value: string,
  ) => {
    if (disabled) return;
    const updatedExisting = existingLinksList.map((link, linkIndex) =>
      linkIndex === index ? { ...link, [field]: value } : link,
    );
    setExistingLinksList(updatedExisting);
    setExistingLinks?.(updatedExisting);
  };

  const removeExistingLink = (index: number) => {
    if (disabled) return;
    const updatedExisting = existingLinksList.filter((_, i) => i !== index);
    setExistingLinksList(updatedExisting);
    setExistingLinks?.(updatedExisting);
  };

  const updateLink = (index: number, field: "title" | "url", value: string) => {
    if (disabled) return;
    const updatedLinks = links.map((link, linkIndex) =>
      linkIndex === index ? { ...link, [field]: value } : link,
    );
    setLinks(updatedLinks);
  };

  const getAvailableTitleOptions = (index: number) => {
    const selectedTitles = new Set([
      ...existingLinksList
        .filter((_, linkIndex) => linkIndex !== index)
        .map((link) => link.title),
      ...links
        .filter((_, linkIndex) => linkIndex !== index)
        .map((link) => link.title),
    ]);

    return linkTitleOptions?.filter(
      (option) => option === links[index].title || !selectedTitles.has(option),
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>Attached Links</label>
        <button
          type="button"
          className={styles.addLinkBtn}
          onClick={addLink}
          disabled={disabled}
        >
          <i className="fa fa-plus" style={{ marginRight: "4px" }}></i>
          Add Link
        </button>
      </div>

      {errors[name] && (
        <span className={styles.error}>{errors[name]?.message as string}</span>
      )}

      <div className={styles.linksList}>
        {existingLinksList.map((link, index) => (
          <div key={`existing-${index}`} className={styles.linksRow}>
            {linkTitleOptions?.length ? (
              <select
                className={styles.linkTitle}
                value={link.title}
                onChange={(e) =>
                  updateExistingLink(index, "title", e.target.value)
                }
                disabled={disabled}
                aria-label="Link title"
              >
                <option value="">Select link title</option>
                {getAvailableTitleOptions(index)?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className={styles.linkTitle}
                placeholder="Link title"
                value={link.title}
                onChange={(e) =>
                  updateExistingLink(index, "title", e.target.value)
                }
                disabled={disabled}
              />
            )}
            <input
              type="url"
              className={styles.linkUrl}
              placeholder="https://"
              value={link.url}
              onChange={(e) => updateExistingLink(index, "url", e.target.value)}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.removeLinkBtn}
              onClick={() => removeExistingLink(index)}
              tabIndex={-1}
              disabled={disabled}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        ))}

        {links.map((link, index) => (
          <div key={`new-${index}`} className={styles.linksRow}>
            {linkTitleOptions?.length ? (
              <select
                className={styles.linkTitle}
                value={link.title}
                onChange={(e) => updateLink(index, "title", e.target.value)}
                disabled={disabled}
                aria-label="Link title"
              >
                <option value="">Select link title</option>
                {getAvailableTitleOptions(index)?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className={styles.linkTitle}
                placeholder="Link title"
                value={link.title}
                onChange={(e) => updateLink(index, "title", e.target.value)}
                disabled={disabled}
              />
            )}
            <input
              type="url"
              className={styles.linkUrl}
              placeholder="https://"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.removeLinkBtn}
              onClick={() => removeLink(index)}
              tabIndex={-1}
              disabled={disabled}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        ))}
      </div>

      <input type="hidden" {...register(name)} />
    </div>
  );
};
