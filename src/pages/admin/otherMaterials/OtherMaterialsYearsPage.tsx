import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { BrowseCard } from "../../../components/card/BrowseCard";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { OtherMaterialsScopeHeader } from "../../../components/materials/OtherMaterialsScopeHeader";
import { useLazyGetDepartmentQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

import styles from "./OtherMaterialsYearsPage.module.css";

export function OtherMaterialsYearsPage() {
    const navigate = useNavigate();
    const { departmentId } = useParams();

    const [department, setDepartment] =
        useState<DepartmentResponseDto | null>(null);
    const [years, setYears] = useState<YearResponseDto[]>([]);

    const [getDepartment] = useLazyGetDepartmentQuery();
    const [getYears] = useLazyGetYearsQuery();

    const fetchDepartment = useCallback(async () => {
        if (!departmentId) return;
        try {
            const response = await getDepartment({
                department_id: Number(departmentId),
            }).unwrap();
            setDepartment(response.data || null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartment, departmentId]);

    const fetchYears = useCallback(async () => {
        try {
            const response = await getYears({ data: {} }).unwrap();
            setYears(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchDepartment(), fetchYears()]),
        [fetchDepartment, fetchYears],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        if (!departmentId) {
            navigate("/admin/other-materials", { replace: true });
        }
    }, [departmentId, navigate]);

    return (
        <Layout>
            <PageSeo
                title="Other Materials - CU Portal Admin"
                description="Pick a year to browse its materials"
            />
            <Banner
                title="Other Materials"
                description="Pick a year to browse its materials"
            />
            <div className={styles.container}>
                <OtherMaterialsScopeHeader
                    departmentName={department?.name}
                    onChangeDepartment={() =>
                        navigate("/admin/other-materials")
                    }
                />
                {years.length === 0 ? (
                    <NoContentSection icon="calendar" label="No years found." />
                ) : (
                    <div className={styles.cardsGrid}>
                        {years.map((year) => (
                            <BrowseCard
                                key={year.id}
                                title={year.year?.toString()}
                                onClick={() =>
                                    navigate(
                                        `/admin/other-materials/${departmentId}/${year.id}`,
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

export default OtherMaterialsYearsPage;
