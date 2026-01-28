import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SetCookie } from "../../utils/CookiesManager";
import { useGetGoogleStoredTokenMutation } from "../../services/apis/AuthenticateAPIs";
import Logo from "../../components/logo/Logo";
import { PageSeo } from "../../components/PageSeo";
import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/login-illustration.png";
import styles from "./LoginSuccessPage.module.css";

const LoginSuccessPage = () => {
    const navigate = useNavigate();
    const [getGoogleStoredToken] = useGetGoogleStoredTokenMutation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const state = searchParams.get("state");
    useEffect(() => {
        const handlePageLoad = async () => {
            if (token) {
                const tokenParts = token.split("___");
                SetCookie(
                    "google_details_token",
                    tokenParts[0],
                    parseInt(tokenParts[1]),
                );
            } else {
                navigate("/login", {
                    state: {
                        error: "Invalid login session. Please try again.",
                    },
                });
                return;
            }

            if (state) {
                SetCookie("oauth_state", state, 60 * 60 * 24 * 30);
            }
        };

        handlePageLoad();
    }, [token, state, navigate, getGoogleStoredToken]);

    const handleContinue = () => {
        navigate("/create-profile");
    };

    return (
        <>
            <PageSeo
                title="Login Successful - CU Portal"
                description="Your Google account has been successfully linked. Complete your profile setup to personalize your CU Portal experience."
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
                        <div
                            className={`${styles.iconCircle} ${styles.success}`}
                        >
                            <span className={styles["material-icons"]}>
                                <i className="fa-solid fa-check"></i>
                            </span>
                        </div>
                        <h2 className={styles.gradientTextH2}>
                            Google Account Linked Successfully
                        </h2>
                        <p>
                            Now Let&apos;s Finish Setting Up Your Profile.
                            <br />
                            Just a Few Quick Steps to Personalize Your
                            Experience.
                        </p>
                        <button
                            className={styles.continueBtn}
                            onClick={handleContinue}
                        >
                            Create Profile Now
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
};

export default LoginSuccessPage;
