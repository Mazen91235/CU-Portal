import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSeo } from "../../../components/PageSeo";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import styles from "./AcademicSettings.module.css";

const academicSchema = z.object({
    faculty: z.string().min(1, "Faculty is required"),
    studyType: z.enum(["Mainstream", "Credit"]),
    year: z.string().min(1, "Year is required"),
    department: z.string().min(1, "Department is required"),
});

type AcademicFormData = z.infer<typeof academicSchema>;

export const AcademicSettings = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AcademicFormData>({
        resolver: zodResolver(academicSchema),
    });

    const onSubmit = async (data: AcademicFormData) => {
        try {
            console.log("Academic data:", data);
        } catch (error) {
            console.error("Failed to update academic settings:", error);
        }
    };

    return (
        <>
            <PageSeo
                title="Academic Settings"
                description="Manage your academic settings"
            />
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h4 className={styles.title}>Academic Settings</h4>
                        <div className={styles.underline} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.formGrid}>
                            <Select
                                register={register}
                                name="faculty"
                                errors={errors}
                                label="Faculty"
                            >
                                <option value="" disabled>
                                    Select your faculty
                                </option>
                            </Select>

                            <Select
                                register={register}
                                name="studyType"
                                errors={errors}
                                label="Study Type"
                            >
                                <option value="" disabled>
                                    Select a study type
                                </option>
                                <option value="Mainstream">Mainstream</option>
                                <option value="Credit">Credit</option>
                            </Select>

                            <Select
                                register={register}
                                name="year"
                                errors={errors}
                                label="Year"
                            >
                                <option value="" disabled>
                                    Select your year
                                </option>
                            </Select>

                            <Select
                                register={register}
                                name="department"
                                errors={errors}
                                label="Department"
                            >
                                <option value="" disabled>
                                    Select your department
                                </option>
                            </Select>
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button type="submit">Save changes</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
