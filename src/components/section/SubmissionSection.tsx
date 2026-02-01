import { Bordered } from "../bordered/Bordered";
import { Heading } from "../heading/Heading";
import { Button } from "../forms/Button";

import styles from "./SubmissionSection.module.css";

export const SubmissionSection = ({ url }: { url: string }) => {
    return (
        <Bordered>
            <Heading
                icon="check-circle"
                content="Submission Status"
                size="large"
            />
            <div className={styles.submissionContent}>
                <Button
                    text="Go To Submission URL"
                    loadingText=""
                    isSubmitting={false}
                    type="default"
                    onClick={() => window.open(url, "_blank")}
                />
            </div>
        </Bordered>
    );
};
