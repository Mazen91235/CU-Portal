import { useEffect, useState } from "react";
import { Button } from "../forms/Button";
import { FloatingForm } from "../forms/FloatingForm";
import { Select } from "../forms/Select";

interface MaterialConflictFormProps {
    operation: "copy" | "move";
    isOpen: boolean;
    isSubmitting?: boolean;
    onClose: () => void;
    onConfirm: (shouldOverwrite: boolean) => void;
}

export function MaterialConflictForm({
    operation,
    isOpen,
    isSubmitting = false,
    onClose,
    onConfirm,
}: MaterialConflictFormProps) {
    const [shouldOverwrite, setShouldOverwrite] = useState(false);

    useEffect(() => {
        if (isOpen) setShouldOverwrite(false);
    }, [isOpen]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        onConfirm(shouldOverwrite);
    };

    return (
        <FloatingForm<Record<string, unknown>>
            isOpen={isOpen}
            onSubmit={handleSubmit}
            errors={{}}
            title={`${operation === "copy" ? "Copy" : "Move"} Materials`}
            onClose={onClose}
            disabled={isSubmitting}
        >
            <Select<Record<string, unknown>>
                name="should_overwrite"
                errors={{}}
                value={shouldOverwrite ? "true" : "false"}
                onChange={(event) =>
                    setShouldOverwrite(event.target.value === "true")
                }
                label="On Conflict"
            >
                <option value="false">Rename</option>
                <option value="true">Overwrite</option>
            </Select>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.75rem",
                    marginTop: "0.75rem",
                }}
            >
                <Button
                    type="button"
                    text="Cancel"
                    loadingText="Canceling..."
                    isSubmitting={isSubmitting}
                    isDefault={true}
                    onClick={onClose}
                />
                <Button
                    type="submit"
                    text={operation === "copy" ? "Copy" : "Move"}
                    loadingText={
                        operation === "copy" ? "Copying..." : "Moving..."
                    }
                    isSubmitting={isSubmitting}
                    isOrange={false}
                />
            </div>
        </FloatingForm>
    );
}

export default MaterialConflictForm;
