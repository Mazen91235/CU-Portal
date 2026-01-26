import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSeo } from "../../../components/PageSeo";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import styles from "./ProfileSettings.module.css";
import { Layout } from "../../../components/layout/Layout";

const profileSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email(),
    phone: z.string(),
    nationalId: z.string(),
    gender: z.enum(["male", "female"]),
    googleAccount: z.string(),
    avatar: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileSettings = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    const [avatarPreview, setAvatarPreview] = useState(
        "https://randomuser.me/api/portraits/women/44.jpg",
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            console.log("Profile data:", data);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    const handleAvatarChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview("https://randomuser.me/api/portraits/women/44.jpg");
        setValue("avatar", null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <PageSeo
                title="Profile Settings"
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
                            <img
                                src={avatarPreview}
                                alt="Profile"
                                className={styles.avatar}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload New
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRemoveAvatar}
                                variant="remove"
                            >
                                Remove Profile Photo
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={styles.formGrid}>
                                <Input
                                    register={register}
                                    name="fullName"
                                    type="text"
                                    placeholder="somia ali mohmad"
                                    errors={errors}
                                    label="Full Name"
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
                                <Input
                                    register={register}
                                    name="phone"
                                    type="text"
                                    placeholder="01016424526"
                                    errors={errors}
                                    label="Phone Number"
                                    disabled
                                />
                                <Input
                                    register={register}
                                    name="nationalId"
                                    type="text"
                                    placeholder="Enter Your National ID"
                                    errors={errors}
                                    label="National ID"
                                    disabled
                                />
                                <Select
                                    register={register}
                                    name="gender"
                                    errors={errors}
                                    label="Gender"
                                >
                                    <option value="" disabled>
                                        Select your gender
                                    </option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Select>
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

                            <div className={styles.buttonGroup}>
                                <Button type="submit">Save Changes</Button>
                                <Button type="button" variant="google">
                                    <img
                                        src="/assets/Group 4.png"
                                        alt="Google"
                                        className={styles.googleIcon}
                                    />
                                    Change Google account
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
};
