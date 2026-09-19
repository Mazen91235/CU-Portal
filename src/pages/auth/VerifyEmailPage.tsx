import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetTokenDetailsQuery,
    useVerifyEmailMutation,
    useResendTokenMutation,
} from "../../services/apis/AuthenticateAPIs";
import { PageSeo } from "../../components/PageSeo";
import Logo from "../../components/logo/Logo";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/forms/Button";
import type { DefaultAPIResponse } from "../../types/responses/GenericAPIResponse";
import { usePageLoading } from "../../hooks/usePageLoading";

import { handlePopupErrors } from "../../utils/ErrorHandling";
import IconComponent from "../../components/IconComponent";
import { showToast } from "../../utils/ToastsManager";

import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/login-illustration.png";

import styles from "./VerifyEmailPage.module.css";

const verifyEmailSchema = z.object({
    code: z
        .string()
        .min(6, "Verification code must be 6 digits")
        .max(6, "Verification code must be 6 digits")
        .regex(/^\d+$/, "Verification code must contain only numbers"),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState("");
    const [canResendAfter, setCanResendAfter] = useState(0);
    const [getVerificationDetails] = useLazyGetTokenDetailsQuery();
    const [verifyEmail] = useVerifyEmailMutation();
    const [resendVerificationCode] = useResendTokenMutation();
    usePageLoading(true);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyEmailFormData>({
        resolver: zodResolver(verifyEmailSchema),
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await getVerificationDetails().unwrap();
                setUserEmail(response.data?.email || "");
                setCanResendAfter(response.data?.can_resend_after || 0);
            } catch (error) {
                const err = error as DefaultAPIResponse;
                navigate("/login", {
                    state: {
                        error:
                            err.data?.message || "Failed to fetch your email",
                    },
                });
            }
        };
        fetchUserDetails();
    }, [getVerificationDetails, navigate]);

    useEffect(() => {
        if (canResendAfter > 0) {
            const interval = setInterval(() => {
                setCanResendAfter((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [canResendAfter]);

    const onSubmit = async (data: VerifyEmailFormData) => {
        try {
            await verifyEmail({ token: data.code }).unwrap();
            navigate("/user", {
                state: { success: "Email verified successfully!" },
            });
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleResendCode = async () => {
        if (canResendAfter > 0) {
            showToast(
                "error",
                "Error",
                `You can resend the code after ${canResendAfter} second${canResendAfter === 1 ? "" : "s"}`,
            );
            return;
        }
        try {
            await resendVerificationCode().unwrap();
            const response = await getVerificationDetails().unwrap();
            showToast(
                "success",
                "Success",
                "Verification code resent successfully",
            );
            setCanResendAfter(response.data?.can_resend_after || 60);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <>
            <PageSeo
                title="Email Verification - CU Portal"
                description="Verify your email address to complete your registration and access your CU Portal account."
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

                <main className={styles.contentWrapper}>
                    <div className={styles.illustration}>
                        <img
                            src={illustrationImg}
                            alt="Happy student illustration"
                        />
                    </div>
                    <div className={styles.welcomeCard}>
                        <div className={styles.iconCircle}>
                            <IconComponent icon="verify" />
                        </div>
                        <div className={styles.title}>EMAIL VERIFICATION</div>
                        <div className={styles.subtitle}>
                            We've sent a 6-digit verification code to
                        </div>
                        <div className={styles.emailContainer}>{userEmail}</div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <fieldset
                                disabled={isSubmitting}
                                className={styles.inputGroup}
                            >
                                <Input
                                    register={register}
                                    name="code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    errors={errors}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    text="Verify Email"
                                    loadingText="Verifying..."
                                    isSubmitting={isSubmitting}
                                    isOrange={false}
                                />
                            </fieldset>
                        </form>
                        <div className={styles.resendContainer}>
                            <span>Didn't receive the code?</span>
                            <button
                                onClick={handleResendCode}
                                className={styles.resendLink}
                                disabled={isSubmitting || canResendAfter > 0}
                                type="button"
                            >
                                {canResendAfter > 0
                                    ? `Resend Code (${Math.ceil(canResendAfter)}s)`
                                    : "Resend code"}
                            </button>
                        </div>
                        <span className={styles.infoBox}>
                            Check your inbox or spam folder
                        </span>
                    </div>
                </main>
            </div>
        </>
    );
};
