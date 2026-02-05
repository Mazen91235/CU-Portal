import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SetCookie } from "../../utils/CookiesManager";
import { PageSeo } from "../../components/PageSeo";
import Logo from "../../components/logo/Logo";
import { usePageLoading } from "../../hooks/usePageLoading";

import { GetWebLink, GetIcon } from "../../utils/LinkHandler";

import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/login-illustration.png";
import { useAppDispatch } from "../../services/redux/Hooks";
import {
    setAccessToken,
    setIsProcessing,
} from "../../services/redux/reducers/UserReducer";

import styles from "./LoginPage.module.css";
import { handlePopupErrors } from "../../utils/ErrorHandling";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [tokenParts, setTokenParts] = useState<(string | number)[] | null>(
        null,
    );
    const [searchParams] = useSearchParams();
    usePageLoading(true);
    const token = searchParams.get("token");

    useEffect(() => {
        const handlePageLoad = async () => {
            if (token) {
                const tokenParts = token.split("___");
                dispatch(setIsProcessing(true));
                setTokenParts(tokenParts);
            }
        };
        handlePageLoad();
    }, [token, dispatch]);

    useEffect(() => {
        const processToken = async () => {
            if (tokenParts) {
                try {
                    SetCookie(
                        "access_token",
                        tokenParts[0] as string,
                        tokenParts[1] as number,
                    );
                    SetCookie(
                        "refresh_token",
                        tokenParts[2] as string,
                        tokenParts[3] as number,
                    );
                    dispatch(setAccessToken(tokenParts[0] as string));
                    navigate("/user", {
                        state: {
                            isProcessing: true,
                        },
                    });
                } catch (error) {
                    handlePopupErrors(error);
                }
            }
        };
        processToken();
    }, [tokenParts, navigate, dispatch]);

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
                        <a
                            className={styles.googleSigninBtn}
                            href={GetWebLink("login-with-google")}
                            aria-label="Sign in with Google"
                        >
                            <img
                                src={GetIcon("google")}
                                alt=""
                                className={styles.googleIcon}
                                aria-hidden="true"
                            />
                            Sign up / in with Google
                        </a>
                    </div>
                </main>
            </div>
        </>
    );
};

export default LoginPage;
