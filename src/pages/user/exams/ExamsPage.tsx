import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLazyGetExamsQuery } from "../../../services/apis/user/ExamAPIs";
import type { Task } from "../../../types/entities/Task";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDate, formatTime } from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";

import styles from "./ExamsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export const ExamsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [exams, setExams] = useState<Task[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchParams] = useSearchParams();
    const [getSubjects] = useLazyGetEnrolledCoursesQuery();
    const [getExams, { isFetching }] = useLazyGetExamsQuery();

    const fetchSubjects = useCallback(async () => {
        try {
            const result = await getSubjects().unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects]);

    const fetchExams = useCallback(async () => {
        try {
            if (!hasNextPage) return;
            const result = await getExams({
                query: searchQuery || undefined,
                start_date: dateFromFilter || undefined,
                end_date: dateToFilter || undefined,
                subject_id: parseInt(subjectFilter) || undefined,
                page,
            }).unwrap();
            setExams((prev) => {
                const filteredPrev = prev.filter(
                    (exam) =>
                        !result.data?.some((newExam) => newExam.id === exam.id),
                );
                if (page == 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getExams,
        searchQuery,
        subjectFilter,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
    ]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchSubjects(), fetchExams()]),
        [fetchSubjects, fetchExams],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, subjectFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        const subject_id = searchParams.get("subject_id") || "";
        if (subject_id && subjects.length > 0) {
            setSubjectFilter(subject_id);
        }
    }, [searchParams, subjects]);

    const handleViewExam = (examId: number) => {
        navigate(`/user/exams/${examId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && exams.length > 0) {
            setPage(page + 1);
        }
    };

    const handleShareExam = (examId: number) => {
        const url = `${window.location.origin}/user/exams/${examId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Exam link copied to clipboard successfully",
        );
    };

    const subjectOptions = useMemo(() => {
        const options = [{ label: "All Subjects", value: "" }];
        options.push(
            ...subjects.map((subject) => ({
                label: subject.name || "N/A",
                value: subject.id?.toString() || "",
            })),
        );
        return options;
    }, [subjects]);

    return (
        <Layout>
            <PageSeo
                title="Exams - CU Portal"
                description="View all your university exams"
            />

            <Banner
                title="My Exams"
                description="View all your university exams"
            />

            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search exams..."
                            setValue={setSearchQuery}
                        />
                    </div>

                    <div className={styles.filtersRow}>
                        <SelectFilter
                            value={subjectFilter}
                            options={subjectOptions}
                            setValue={setSubjectFilter}
                        />
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                        />
                    </div>
                </div>

                <div className={styles.examsGrid}>
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            title={exam.name || "Untitled Exam"}
                            badge={exam.subject?.code}
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value: formatDate(exam.due_date) || "N/A",
                                },
                                {
                                    icon: "time",
                                    label: "Time",
                                    value: formatTime(exam.deadline) || "N/A",
                                },
                                {
                                    icon: "location",
                                    label: "Location",
                                    value: exam.details?.location || "N/A",
                                },
                            ]}
                            button="View Exam"
                            buttonAction={() => handleViewExam(exam.id!)}
                            hasOptions
                            sharable
                            onShare={() => handleShareExam(exam.id!)}
                        />
                    ))}
                </div>

                {exams.length === 0 && !isFetching && (
                    <NoContentSection
                        icon="clipboard-list"
                        label="No exams found"
                    />
                )}

                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
