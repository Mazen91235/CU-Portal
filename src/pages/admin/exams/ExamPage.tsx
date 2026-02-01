import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetExamQuery } from "../../../services/apis/admin/ExamAPIs";
import type { Task } from "../../../types/entities/Task";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./ExamPage.module.css";

export const ExamPage = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Task | null>(null);

    const [getExam] = useLazyGetExamQuery();

    const fetchExam = useCallback(async () => {
        if (!examId) return;

        try {
            const result = await getExam({
                exam_id: parseInt(examId),
            }).unwrap();
            setExam(result.data || null);
        } catch (error) {
            const err = error as DefaultAPIResponse;
            navigate("/admin/exams", {
                state: { error: err.data.message || "Failed to fetch exam" },
            });
        }
    }, [getExam, navigate, examId]);

    const authQueryParams = useCallback(() => fetchExam(), [fetchExam]);

    useAuthQuery(authQueryParams);

    if (!exam) {
        return null;
    }

    return (
        <Layout>
            <PageSeo
                title={`${exam.name} - Exam Details - CU Portal`}
                description={`View and manage exam information for ${exam.name}`}
            />

            <SubBanner
                title={exam.name || "Exam Details"}
                icon={GetIcon("task")}
                button="Edit Exam"
                buttonAction={() => navigate(`/admin/exams/edit/${exam.id}`)}
                linkText="Back to Exams"
                linkTo="/admin/exams"
            />

            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Subject"
                        value={exam.subject?.name || "N/A"}
                        icon="book"
                    />
                    <StatCard
                        type="Date"
                        value={formatDateTime(exam.deadline) || "N/A"}
                        icon="calendar"
                    />
                    <StatCard
                        type="Duration"
                        value={
                            exam.details?.duration
                                ? `${exam.details.duration} hours`
                                : "N/A"
                        }
                        icon="clock"
                    />
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainContent}>
                        {exam.details?.instructions && (
                            <LongSection
                                title="Exam Instructions"
                                icon="file-text"
                            >
                                <div className={styles.instructionsContent}>
                                    {exam.details.instructions && (
                                        <ul>
                                            {exam.details.instructions
                                                .split("\n")
                                                .map((instruction, index) => (
                                                    <div
                                                        key={index}
                                                        className={
                                                            styles.instruction
                                                        }
                                                    >
                                                        <li>{instruction}</li>
                                                    </div>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            </LongSection>
                        )}

                        <LongSection title="Description" icon="align-left">
                            {exam.details?.description || (
                                <span>No description available</span>
                            )}
                        </LongSection>
                    </div>

                    <div className={styles.sidebar}>
                        <QuickInfoSection
                            items={[
                                { label: "Type:", value: "Exam" },
                                {
                                    label: "Location:",
                                    value: exam.details?.location || "N/A",
                                },
                                {
                                    label: "Faculty:",
                                    value: exam.faculty?.name || "N/A",
                                },
                                {
                                    label: "Department:",
                                    value: exam.department?.name || "N/A",
                                },
                                {
                                    label: "Year:",
                                    value: exam.year?.year?.toString() || "N/A",
                                },
                                {
                                    label: "Exam Type:",
                                    value: exam.details?.exam_type || "N/A",
                                },
                                {
                                    label: "Format:",
                                    value: exam.details?.exam_format || "N/A",
                                },
                                {
                                    label: "Weight:",
                                    value: exam.details?.exam_weight || "N/A",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
