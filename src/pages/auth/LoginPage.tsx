import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { SetCookie } from "../../utils/CookiesManager";
import { PageSeo } from "../../components/PageSeo";
import Logo from "../../components/logo/Logo";
import { usePageLoading } from "../../hooks/usePageLoading";

import { GetWebLink, GetIcon } from "../../utils/LinkHandler";

import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/login-illustration.png";

import styles from "./LoginPage.module.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    usePageLoading(true);
    const token = searchParams.get("token");

    useEffect(() => {
        const handlePageLoad = async () => {
            if (token) {
                const tokenParts = token.split("___");
                SetCookie(
                    "access_token",
                    tokenParts[0],
                    parseInt(tokenParts[1]),
                );
                SetCookie(
                    "refresh_token",
                    tokenParts[2],
                    parseInt(tokenParts[3]),
                );
                navigate("/user");
            }
        };
        handlePageLoad();
    }, [token, navigate]);

    return (
        <>
            <PageSeo
                title="Login - CU Portal"
                description="Sign in to CU Portal with your Google account to access your academic dashboard and student services."
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
                        <h2 className={styles.gradientTextH2}>
                            Hello,
                            <br />
                            welcome back
                        </h2>
                        <p>You need to sign in with Google to continue</p>
                        <Link
                            className={styles.googleSigninBtn}
                            to={GetWebLink("login-with-google")}
                            aria-label="Sign in with Google"
                        >
                            <img
                                src={GetIcon("google")}
                                alt=""
                                className={styles.googleIcon}
                                aria-hidden="true"
                            />
                            Sign up / in with Google
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
};

export default LoginPage;
