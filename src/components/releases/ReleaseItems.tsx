import { useEffect, useState } from "react";
import type {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { ReleaseItemMutationDto } from "../../types/dtos/ReleaseItemDtos";
import type { ReleaseItemType } from "../../types/entities/ReleaseItem";
import { showToast } from "../../utils/ToastsManager";
import styles from "./ReleaseItems.module.css";

const releaseItemTypes: ReleaseItemType[] = [
  "Feature",
  "Improvement",
  "Refactoring",
  "Security Fix",
  "Bug Fix",
];

type ReleaseItemsProps<T extends Record<string, unknown>> = {
  register: UseFormRegister<T>;
  name: Path<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  defaultItems?: ReleaseItemMutationDto[];
  disabled?: boolean;
};

export const ReleaseItems = <T extends Record<string, unknown>>({
  register,
  name,
  errors,
  setValue,
  defaultItems,
  disabled = false,
}: ReleaseItemsProps<T>) => {
  const [items, setItems] = useState<ReleaseItemMutationDto[]>(
    defaultItems?.length
      ? defaultItems
      : [{ item_type: "Feature", content: "" }],
  );

  useEffect(() => {
    if (defaultItems?.length) setItems(defaultItems);
  }, [defaultItems]);

  useEffect(() => {
    // @ts-expect-error The generic field is expected to contain release items.
    setValue(name, items);
  }, [items, name, setValue]);

  const updateItem = (
    index: number,
    field: keyof ReleaseItemMutationDto,
    value: string,
  ) => {
    if (disabled) return;
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    if (disabled) return;
    if (items.some((item) => !item.item_type || !item.content.trim())) {
      showToast(
        "error",
        "Error",
        "Please choose a category and describe the update before adding another one.",
      );
      return;
    }
    setItems((currentItems) => [
      ...currentItems,
      { item_type: "Feature", content: "" },
    ]);
  };

  const removeItem = (index: number) => {
    if (disabled) return;
    setItems((currentItems) =>
      currentItems.length === 1
        ? [{ item_type: "Feature", content: "" }]
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <label className={styles.label}>Release Updates</label>
          <span className={styles.count}>
            {items.length} {items.length === 1 ? "update" : "updates"}
          </span>
        </div>
        <button
          type="button"
          className={styles.addItemButton}
          onClick={addItem}
          disabled={disabled}
        >
          <i className="fa fa-plus" aria-hidden="true" />
          Add Update
        </button>
      </div>

      {errors[name] && (
        <span className={styles.error}>{errors[name]?.message as string}</span>
      )}

      <div className={styles.itemsList}>
        {items.map((item, index) => (
          <div className={styles.itemRow} key={`release-item-${index}`}>
            <input
              type="text"
              className={styles.contentInput}
              placeholder="Describe this update..."
              value={item.content}
              onChange={(event) =>
                updateItem(index, "content", event.target.value)
              }
              disabled={disabled}
            />
            <select
              className={styles.typeSelect}
              value={item.item_type}
              onChange={(event) =>
                updateItem(index, "item_type", event.target.value)
              }
              disabled={disabled}
              aria-label={`Release update ${index + 1} category`}
            >
              {releaseItemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.removeItemButton}
              onClick={() => removeItem(index)}
              disabled={disabled}
              aria-label={`Remove release update ${index + 1}`}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <input type="hidden" {...register(name)} />
    </div>
  );
};
