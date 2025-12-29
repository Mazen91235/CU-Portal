import mazenImg from "../../assets/team/mazen-mohsen.jpg";
import mohamedImg from "../../assets/team/mohamed-ahmed.jpg";
import yasmineImg from "../../assets/team/yasmine-tharwat.jpg";
import janaImg from "../../assets/team/jana-nour.jpg";
import hadeerImg from "../../assets/team/hadeer-khalil.jpg";
import somiaImg from "../../assets/team/somia-ali.jpg";
import marwaImg from "../../assets/team/marwa-mohamed.jpg";
import websiteIcon from "../../assets/icons/social-website.png";
import facebookIcon from "../../assets/icons/social-facebook.png";
import linkedinIcon from "../../assets/icons/social-linkedin.png";
import githubIcon from "../../assets/icons/social-github.png";
import linktreeIcon from "../../assets/icons/social-linktree.png";
import styles from "./Team.module.css";

const teamMembers = [
    {
        name: "Mazen Mohsen",
        role: "Computer Engineer",
        roleTitle: "Full Stack Developer",
        university: "Cairo University",
        badge: "Founder & Team Lead",
        image: mazenImg,
        socials: [
            { icon: websiteIcon, url: "https://www.mazen4dev.cu-portal.com" },
            {
                icon: facebookIcon,
                url: "https://www.facebook.com/TechnoArab.TA",
            },
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mazenmohsen15/",
            },
        ],
    },
    {
        name: "Mohamed Ahmed",
        role: "Computer engineer",
        roleTitle: "Frontend Developer",
        university: "Cairo University",
        badge: "Contributor",
        image: mohamedImg,
        socials: [
            {
                icon: websiteIcon,
                url: "https://mohamed-ahmed-2006.github.io/My-Portfolio/",
            },
            { icon: githubIcon, url: "https://github.com/Mohamed-ahmed-2006" },
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mohamed-ahmed-04b5b8380",
            },
        ],
    },
    {
        name: "Yasmin Tharwat",
        role: "Software Engineer",
        roleTitle: "Frontend Developer",
        university: "South Valley University",
        image: yasmineImg,
        socials: [
            { icon: linktreeIcon, url: "https://linktr.ee/Yasmin_Tharwat" },
        ],
    },
    {
        name: "Jana Nour",
        role: "Biomedical engineer",
        roleTitle: "Frontend Developer",
        university: "Cairo University",
        image: janaImg,
        socials: [
            {
                icon: linktreeIcon,
                url: "https://www.linkedin.com/me?trk=p_mwlite_feed-secondary_nav",
            },
            { icon: githubIcon, url: "https://github.com/jananour00" },
        ],
    },
    {
        name: "Hadeer Khalil",
        role: "Faculty of commerce",
        roleTitle: "UI/UX Designer",
        university: "MIS department",
        image: hadeerImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/hadeer-khalil-uiuxcx",
            },
        ],
    },
    {
        name: "Somia Ali",
        role: "Kindergarten",
        roleTitle: "UI/UX Designer",
        university: "Al-Azhar University",
        image: somiaImg,
        socials: [],
    },
    {
        name: "Marwa Mohamed",
        role: "Commerce english sector",
        roleTitle: "UI/UX Designer",
        university: "cairo university",
        image: marwaImg,
        socials: [],
    },
];

export const Team = () => {
    return (
        <section className={styles.teamSection} id="team-section">
            <h2 className={styles.teamTitle}>Our Team</h2>
            <div className={styles.teamMembers}>
                {teamMembers.map((member, index) => (
                    <div key={index} className={styles.teamCard}>
                        {member.badge && (
                            <div>
                                <span className={styles.teamBadge}>
                                    {member.badge}
                                </span>
                            </div>
                        )}
                        <div className={styles.teamCardSemicircle}>
                            <img
                                src={member.image}
                                alt={member.name}
                                className={styles.teamIcon}
                            />
                        </div>
                        <div className={styles.teamName}>{member.name}</div>
                        <div className={styles.teamRole}>
                            <span className={styles.roleTitle}>
                                {member.roleTitle}
                            </span>
                            <br />
                            {member.role}
                            <br />
                            {member.university}
                        </div>
                        {member.socials.length > 0 && (
                            <div className={styles.teamSocials}>
                                {member.socials.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img src={social.icon} alt="Social" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};
