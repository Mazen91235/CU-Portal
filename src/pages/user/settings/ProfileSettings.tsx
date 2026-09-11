import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSeo } from "../../../components/PageSeo";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { useAppSelector } from "../../../services/redux/Hooks";
import { FileInputContainer } from "../../../components/forms/FileInputContainer";
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import { useUpdateUserDataMutation } from "../../../services/apis/user/UserAPIs";
import { usePageLoading } from "../../../hooks/usePageLoading";

import { handleErrors, handlePopupErrors } from "../../../utils/ErrorHandling";
import { GetAvatarLink, GetWebLink } from "../../../utils/LinkHandler";
import { showToast } from "../../../utils/ToastsManager";

import styles from "./ProfileSettings.module.css";
import IconComponent from "../../../components/IconComponent";

const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    phone: z
        .string()
        .min(11, "Phone number is required")
        .max(13, "Invalid phone number"),
    gender: z.enum(["male", "female"]),
    googleAccount: z.string(),
    avatar: z.instanceof(FileList).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileSettings = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        setError,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });
    usePageLoading(true);
    const user = useAppSelector((state) => state.user.user);

    useEffect(() => {
        if (user) {
            setValue("name", user?.name || "");
            setValue("email", user?.email || "");
            setValue("phone", user?.phone || "");
            setValue("gender", (user?.gender as "male" | "female") || "male");
            setValue("googleAccount", user?.google_email || "");
            const avatarPath =
                user?.avatar?.url || user?.google_avatar || "";
            setCurrentImg(GetAvatarLink(avatarPath));
        }
    }, [user, setValue]);
    const fileInput = useRef<HTMLInputElement>(null);
    const uploadFileToDrive = useUploadFileToDrive({
        reject: (error) => {
            handlePopupErrors(error);
        },
    });
    const removeUploadedFiles = useRemoveUploadedFiles();
    const [updateUser] = useUpdateUserDataMutation();
    const onSubmit = async (data: ProfileFormData) => {
        const uploadedUrls: string[] = [];
        try {
            let url = user?.avatar?.url || user?.google_avatar || "";
            if (data.avatar && data.avatar.length > 0) {
                url = (await uploadFileToDrive(data.avatar[0])) || url;
                if (url && url !== (user?.avatar?.url || user?.google_avatar || "")) {
                    uploadedUrls.push(url);
                }
            }
            await updateUser({
                name: data.name,
                details: { avatar: url },
            }).unwrap();
            showToast("success", "Success", "Profile updated successfully.");
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handleErrors(error, setError);
        }
    };

    const changeGoogleAccount = () => {
        const path = "/user/change-google-account";
        localStorage.removeItem("user");
        window.location.href = GetWebLink(path);
    };

    const [currentImg, setCurrentImg] = useState(GetAvatarLink(""));
    const ImgChanged = () => {
        const files = fileInput.current?.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith("image/")) {
                showToast(
                    "error",
                    "Error",
                    "Please select a valid image file.",
                );
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setCurrentImg(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        } else {
            setCurrentImg(GetAvatarLink(""));
        }
    };

    return (
        <>
            <PageSeo
                title="Profile Settings - CU Portal"
                description="Manage your profile settings"
            />
            <Layout>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <h4 className={styles.title}>Profile Settings</h4>
                            <div className={styles.underline} />
                        </div>
                        <div className={styles.avatarGroup}>
                            <FileInputContainer
                                register={register}
                                name="avatar"
                                type="file"
                                errors={errors}
                                ref={fileInput}
                                refCurrent={
                                    fileInput as React.RefObject<
                                        HTMLInputElement | HTMLTextAreaElement
                                    >
                                }
                                currentImg={currentImg}
                                onChange={ImgChanged}
                                disabled={isSubmitting}
                            />
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <Input
                                        register={register}
                                        name="name"
                                        type="text"
                                        placeholder="somia ali mohmad"
                                        errors={errors}
                                        label="Name"
                                        disabled={isSubmitting}
                                    />
                                    <Input
                                        register={register}
                                        name="email"
                                        type="email"
                                        placeholder="aliahmed@gmail.com"
                                        errors={errors}
                                        label="Email"
                                        disabled
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <Input
                                        register={register}
                                        name="phone"
                                        type="text"
                                        placeholder="01016424526"
                                        errors={errors}
                                        label="Phone Number"
                                        disabled
                                    />
                                    <Select
                                        register={register}
                                        name="gender"
                                        errors={errors}
                                        label="Gender"
                                        disabled
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </Select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <Input
                                        register={register}
                                        name="googleAccount"
                                        type="text"
                                        placeholder="Enter Your Google Account"
                                        errors={errors}
                                        label="Google Account"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className={styles.buttonGroup}>
                                <Button
                                    text="Save Changes"
                                    loadingText="Saving..."
                                    isSubmitting={isSubmitting}
                                    isOrange={false}
                                />
                                <button
                                    type="button"
                                    className={styles.googleButton}
                                    onClick={changeGoogleAccount}
                                >
                                    <IconComponent
                                        icon="google"
                                        className={styles.googleIcon}
                                    />
                                    Change Google account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
};
