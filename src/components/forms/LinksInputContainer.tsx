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

export const LinksInputContainer = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    setValue,
    defaultValue,
    existingLinks,
    setExistingLinks,
    disabled,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    defaultValue?: string;
    existingLinks?: LinkDataWithExisting[];
    setExistingLinks?: (links: LinkDataWithExisting[]) => void;
    disabled?: boolean;
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
        updateFormValue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [links, existingLinksList]);

    const parseLinksString = (linksString: string): LinkDataWithExisting[] => {
        if (!linksString || linksString.trim() === "")
            return [{ title: "", url: "" }];

        const linkPairs = linksString
            .split(",")
            .map((pair) => pair.trim())
            .filter(Boolean);
        return linkPairs.map((pair) => {
            const [title, url] = pair.split("|").map((part) => part.trim());
            return { title: title || "", url: url || "" };
        });
    };

    const formatLinksString = (): string => {
        const allLinks = [
            ...existingLinksList.filter(
                (link) => link.title?.trim() && link.url?.trim(),
            ),
            ...links.filter(
                (link) => link.title.trim() !== "" || link.url.trim() !== "",
            ),
        ];
        return allLinks.map((link) => `${link.title}|${link.url}`).join(", ");
    };

    const updateFormValue = () => {
        const formattedString = formatLinksString();
        // @ts-expect-error - String type is correct but doesn't match generic form type
        setValue(name, formattedString);
    };

    const addLink = () => {
        if (disabled) return;
        if (
            links.some(
                (link) => link.title.trim() === "" || link.url.trim() === "",
            )
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

    const removeExistingLink = (index: number) => {
        if (disabled) return;
        const updatedExisting = existingLinksList.filter((_, i) => i !== index);
        setExistingLinksList(updatedExisting);
        if (setExistingLinks) {
            setExistingLinks(updatedExisting);
        }
    };

    const updateLink = (
        index: number,
        field: "title" | "url",
        value: string,
    ) => {
        if (disabled) return;
        const updatedLinks = [...links];
        updatedLinks[index][field] = value;
        setLinks(updatedLinks);
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
                    <i
                        className="fa fa-plus"
                        style={{ marginRight: "4px" }}
                    ></i>
                    Add Link
                </button>
            </div>

            {errors[name] && (
                <span className={styles.error}>
                    {errors[name]?.message as string}
                </span>
            )}

            <div className={styles.linksList}>
                {existingLinksList.map((link, index) => (
                    <div key={`existing-${index}`} className={styles.linksRow}>
                        <input
                            type="text"
                            className={styles.linkTitle}
                            placeholder="Link title"
                            value={link.title}
                            readOnly
                            disabled={disabled}
                        />
                        <input
                            type="url"
                            className={styles.linkUrl}
                            placeholder="https://"
                            value={link.url}
                            readOnly
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
                        <input
                            type="text"
                            className={styles.linkTitle}
                            placeholder="Link title"
                            value={link.title}
                            onChange={(e) =>
                                updateLink(index, "title", e.target.value)
                            }
                            disabled={disabled}
                        />
                        <input
                            type="url"
                            className={styles.linkUrl}
                            placeholder="https://"
                            value={link.url}
                            onChange={(e) =>
                                updateLink(index, "url", e.target.value)
                            }
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
