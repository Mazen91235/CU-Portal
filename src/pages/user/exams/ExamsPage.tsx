import { useState, useCallback, useEffect, useMemo } from "react";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { useNavigate } from "react-router";
import { useLazyGetExamsQuery } from "../../../services/apis/user/ExamAPIs";
import type { ExamResponseDto } from "../../../types/dtos/ExamDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDateTime, toIsoFormat } from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";

import styles from "./ExamsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export const ExamsPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const subjectFilter = getFilter("subject_id", "");
    const setSubjectFilter = getFilterSetter("subject_id");
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const dateFromFilter = getFilter("date_from", new Date().toLocaleDateString("en-CA"));
    const setDateFromFilter = getFilterSetter("date_from", true);
    const dateToFilter = getFilter("date_to", "");
    const setDateToFilter = getFilterSetter("date_to", true);
    const [exams, setExams] = useState<ExamResponseDto[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
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
                data: {
                    query: searchQuery || undefined,
                    deadline_from: toIsoFormat(dateFromFilter),
                    deadline_to: toIsoFormat(dateToFilter),
                    subject_id: parseInt(subjectFilter) || undefined,
                },
                includes: ["subject"],
                order_by: ["deadline_nearest"],
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
            setHasNextPage(result.next_page || false);
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

    const authFilterQuery = useCallback(
        () => Promise.all([fetchSubjects()]),
        [fetchSubjects],
    );

    const authFetchExamsQuery = useCallback(
        () => fetchExams(),
        [fetchExams],
    );

    useAuthQuery(authFilterQuery);
    useAuthQuery(authFetchExamsQuery);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, subjectFilter, dateFromFilter, dateToFilter]);

    const handleViewExam = (examId: number) => {
        navigate(buildRedirectUrl(`/user/exams/${examId}`));
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
                            setValue={setSearchQuery} value={searchQuery}
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
                            defaultDate={dateFromFilter} // Set default date to today's date in "YYYY-MM-DD" format
                            value={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                            value={dateToFilter}
                            startDay={false}
                        />
                    </div>
                </div>

                <div className={styles.examsGrid}>
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            title={exam.name || "Untitled Exam"}
                            badge={exam.subject?.code || undefined}
                            items={[
                                {
                                    icon: "subject",
                                    label: "Subject",
                                    value: exam.subject?.name || "N/A",
                                },
                                {
                                    icon: "time",
                                    label: "Due",
                                    value:
                                        formatDateTime(exam.deadline) || "N/A",
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
