import { PageSeo } from "../../components/PageSeo";
import Logo from "../../components/logo/Logo";
import { usePageLoading } from "../../hooks/usePageLoading";

import { GetWebLink } from "../../utils/LinkHandler";
import IconComponent from "../../components/IconComponent";

import decorTop from "../../assets/decorations/bg-top.png";
import decorBottom from "../../assets/decorations/bg-bottom.png";
import illustrationImg from "../../assets/decorations/login-illustration.png";

import styles from "./LoginPage.module.css";

const LoginPage = () => {
    usePageLoading(true);
    let path = "auth/login-with-google";
    if (window.location.origin.includes("localhost")) {
        path += "?localhost=true";
    }
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
                            href={GetWebLink(path)}
                            aria-label="Sign in with Google"
                        >
                            <IconComponent
                                icon="google"
                                className={styles.googleIcon}
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
