import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { GetCookie } from "../../utils/CookiesManager";
import { handleErrors } from "../../utils/ErrorHandling";
import { showToast } from "../../utils/ToastsManager";
import { useSignupMutation } from "../../services/apis/AuthenticateAPIs";
import { Form } from "../../components/forms/Form";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/forms/Button";
import { Select } from "../../components/forms/Select";
import Logo from "../../components/logo/Logo";
import { PageSeo } from "../../components/PageSeo";
import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/create-profile-illustration.png";
import styles from "./CreateProfilePage.module.css";
import { useUploadFileToDrive } from "../../hooks/useHandleProcesses";
import { InputError } from "../../components/forms/InputError";

const CreateProfilePage = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [signup] = useSignupMutation();

    const schema = z
        .object({
            name: z.string().min(1, "Name is required"),
            email: z.email("Invalid email address"),
            phone: z.string().min(1, "Phone number is required"),
            national_id: z.string().min(1, "National ID is required"),
            gender: z.enum(["male", "female", ""], {
                message: "Please select a gender",
            }),
            agreed: z
                .boolean()
                .refine(
                    (val) => val === true,
                    "You must agree to terms and privacy policy",
                ),
            early_access: z.boolean().optional(),
        })
        .refine((data) => data.gender != "", {
            message: "Please select a gender",
            path: ["gender"],
        });
    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            early_access: false,
            gender: "",
        },
    });

    useEffect(() => {
        const checkAuth = async () => {
            const googleToken = GetCookie("google_details_token");
            const oauthState = GetCookie("oauth_state");

            if (!googleToken || !oauthState) {
                navigate("/login", {
                    state: {
                        error: "Please Authorize Google Account First to Proceed.",
                    },
                });
                return;
            }
        };

        checkAuth();
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            showToast("error", "Error", "Only image files are allowed");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast("error", "Error", "File size must be less than 10MB");
            return;
        }
        setSelectedFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const uploadFile = useUploadFileToDrive({
        file: selectedFile!,
        reject: (error: string) => {
            showToast("error", "Error", error);
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            const googleDetailsToken = GetCookie("google_details_token");
            if (!googleDetailsToken) {
                navigate("/login", {
                    state: {
                        error: "Please Authorize Google Account First to Proceed.",
                    },
                });
                return;
            }
            let fileUrl: string | null = null;
            if (selectedFile) {
                fileUrl = (await uploadFile()) || "";
                if (!fileUrl) {
                    return;
                }
            }

            await signup({
                name: data.name,
                email: data.email,
                phone: data.phone,
                national_id: data.national_id,
                gender: data.gender,
                agreed: data.agreed,
                early_access: data.early_access || false,
                google_details_token: googleDetailsToken,
                url: fileUrl || undefined,
            }).unwrap();

            navigate("/verify-email", {
                state: {
                    success:
                        "Profile created successfully. Please verify your email.",
                },
            });
        } catch (error: unknown) {
            handleErrors(error, setError);
        }
    };

    return (
        <>
            <PageSeo
                title="Create Profile - CU Portal"
                description="Complete your CU Portal profile by providing your academic information and personal details."
            />
            <div className={styles.container}>
                <img
                    src={decorTop}
                    alt=""
                    className={styles.cornerImageTopRight}
                />
                <img
                    src={decorBottom}
                    alt=""
                    className={styles.cornerImageBottomLeft}
                />
                <header className={styles.header}>
                    <Logo />
                </header>

                <div className={styles.contentWrapper}>
                    <div className={styles.illustration}>
                        <img
                            src={illustrationImg}
                            alt="Student writing illustration"
                            className={styles.illustrationImg}
                        />
                    </div>
                    <div className={styles.profileFormCard}>
                        <img
                            src={illustrationImg}
                            alt="Student writing illustration"
                            className={styles.illustrationImgMobile}
                        />
                        <h2 className={styles.gradientTextH2}>
                            create your profile
                        </h2>
                        <p className={styles.subtitle}>
                            Don&apos;t miss out! Create your profile in minutes
                        </p>

                        <Form onSubmit={handleSubmit(onSubmit)} errors={errors}>
                            <div className={styles.inputRow}>
                                <Input
                                    register={register}
                                    name="name"
                                    label="Name"
                                    type="text"
                                    placeholder="Name"
                                    errors={errors}
                                />
                                <Input
                                    register={register}
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="yourname@stud.cu.edu.eg"
                                    errors={errors}
                                />
                            </div>
                            <div className={styles.inputRow}>
                                <Input
                                    register={register}
                                    name="phone"
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="Phone Number"
                                    errors={errors}
                                />
                                <Input
                                    register={register}
                                    name="national_id"
                                    label="National ID"
                                    type="text"
                                    placeholder="National ID"
                                    errors={errors}
                                />
                            </div>
                            <div className={styles.inputRow}>
                                <Select
                                    register={register}
                                    name="gender"
                                    label="Gender"
                                    errors={errors}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Select>
                                <div>
                                    <label
                                        htmlFor="file"
                                        className="w-100 text-start"
                                    >
                                        Proof of Enrollment
                                    </label>
                                    <div
                                        className={`${styles.fileInputGroup} ${isDragging ? styles.dragOver : ""}`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() =>
                                            document
                                                .getElementById("file")
                                                ?.click()
                                        }
                                    >
                                        <input
                                            type="file"
                                            id="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className={styles.hiddenFileInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder={
                                                selectedFile
                                                    ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                                                    : "University ID or Photo of Approval"
                                            }
                                            readOnly
                                        />
                                        <label
                                            className={
                                                styles.attachmentInfoText
                                            }
                                        >
                                            Only needed if the email you entered
                                            isn&apos;t The University Email
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    {...register("agreed")}
                                />
                                <label htmlFor="terms">
                                    agree to{" "}
                                    <Link to="/terms-of-service">
                                        our terms
                                    </Link>{" "}
                                    &{" "}
                                    <Link to="/privacy-policy">
                                        privacy policy
                                    </Link>
                                </label>
                            </div>
                            {errors.agreed && (
                                <div className="w-100 text-start">
                                    <InputError>
                                        {errors.agreed.message}
                                    </InputError>
                                </div>
                            )}

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="subscription"
                                    {...register("early_access")}
                                />
                                <label htmlFor="subscription">
                                    Register in <b>Early Access Membership</b>{" "}
                                    to try New Features before anyone else
                                </label>
                            </div>

                            {errors.early_access && (
                                <div className="w-100 text-start">
                                    <InputError>
                                        {errors.early_access.message}
                                    </InputError>
                                </div>
                            )}

                            <Button
                                text="Create Profile Now!"
                                loadingText="Creating Profile..."
                                isSubmitting={isSubmitting}
                            />
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateProfilePage;
