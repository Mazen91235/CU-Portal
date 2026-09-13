import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { BrowseCard } from "../../../components/card/BrowseCard";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/user/DepartmentAPIs";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./OtherMaterialsDepartmentsPage.module.css";

export function OtherMaterialsDepartmentsPage() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);

    const [departments, setDepartments] = useState<DepartmentResponseDto[]>(
        [],
    );

    const [getDepartments] = useLazyGetDepartmentsQuery();

    const fetchDepartments = useCallback(async () => {
        try {
            if (!user?.faculty?.id || !user.study_type) {
                setDepartments([]);
                return;
            }

            const response = await getDepartments({
                data: {
                    faculty_id: user.faculty.id,
                    study_type: user.study_type,
                },
            }).unwrap();

            setDepartments(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, user]);

    useAuthQuery(fetchDepartments);

    return (
        <Layout>
            <PageSeo
                title="Other Materials - CU Portal"
                description="Browse course materials from other departments"
            />
            <Banner
                title="Other Materials"
                description="Pick a department to browse its materials"
            />
            <div className={styles.container}>
                {departments.length === 0 ? (
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
                                        `/user/other-materials/${department.id}`,
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
