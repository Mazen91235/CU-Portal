import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { BrowseCard } from "../../../components/card/BrowseCard";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { useAppSelector } from "../../../services/redux/Hooks";
import type { DepartmentStudyType } from "../../../types/entities/Department";

import styles from "./OtherMaterialsDepartmentsPage.module.css";

export function OtherMaterialsDepartmentsPage() {
    const navigate = useNavigate();
    const { getFilter } = useFilterSearchParams();
    const studyType = getFilter("study_type", "");
    const user = useAppSelector((state) => state.user.user);

    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);

    const [getDepartments] = useLazyGetDepartmentsQuery();

    const fetchDepartments = useCallback(async () => {
        try {
            if (!studyType || !user?.faculty?.id) {
                setDepartments([]);
                return;
            }

            const response = await getDepartments({
                data: {
                    faculty_id: user.faculty.id,
                    study_type: studyType as DepartmentStudyType,
                },
            }).unwrap();

            setDepartments(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, studyType, user]);

    useAuthQuery(fetchDepartments);

    return (
        <Layout>
            <PageSeo
                title="Other Materials - CU Portal Admin"
                description="Browse course materials from other departments"
            />
            <Banner
                title="Other Materials"
                description={
                    studyType
                        ? `Pick a department for ${studyType} materials`
                        : "Choose a study type to browse its materials"
                }
            />
            <div className={styles.container}>
                {!studyType ? (
                    <div className={styles.cardsGrid}>
                        {(["Mainstream", "Credit"] as const).map((type) => (
                            <BrowseCard
                                key={type}
                                title={type}
                                onClick={() =>
                                    navigate(`/admin/other-materials?study_type=${type}`)
                                }
                            />
                        ))}
                    </div>
                ) : departments.length === 0 ? (
                    <NoContentSection
                        icon="building"
                        label="No other departments found in your faculty."
                    />
                ) : (
                    <div className={styles.cardsGrid}>
                        {departments.map((department) => (
                            <BrowseCard
                                key={department.id}
                                title={department.name}
                                onClick={() =>
                                    navigate(
                                        `/admin/other-materials/years?study_type=${studyType}&department_id=${department.id}`,
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default OtherMaterialsDepartmentsPage;
