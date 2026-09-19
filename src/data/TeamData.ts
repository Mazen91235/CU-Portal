import mazenMohsenImg from "../assets/team/mazen-mohsen.jpg";
import mohamedAhmedImg from "../assets/team/mohamed-ahmed.jpg";
import omarMagdyImg from "../assets/team/omar-magdy.jpg";
import omarNagyImg from "../assets/team/omar-nagy.jpeg";
import mariamSamehImg from "../assets/team/mariam-sameh.jpg";
import habibaMahmoudImg from "../assets/team/habiba-mahmoud.png";
import rojanHamdyImg from "../assets/team/rojan-hamdy.jpg";
import anneOmerImg from "../assets/team/anne-omer.jpg";
import mariamMohamedImg from "../assets/team/mariam-mohamed.png";
import abdelrhmanMohamedImg from "../assets/team/abdelrhman-mohamed.jpg";
import yasmineTharwatImg from "../assets/team/yasmine-tharwat.jpg";
import janaNourImg from "../assets/team/jana-nour.jpg";
import nayraSamyImg from "../assets/team/nayra-samy.jpeg";
import hadeerKhalilImg from "../assets/team/hadeer-khalil.jpg";
import somiaAliImg from "../assets/team/somia-ali.jpg";
import marwaMohamedImg from "../assets/team/marwa-mohamed.jpg";
import jasmineIsmailImg from "../assets/team/jasmine-ismail.jpeg";
import websiteIcon from "../assets/icons/social-website.png";
// import facebookIcon from "../assets/icons/social-facebook.png";
import linkedinIcon from "../assets/icons/social-linkedin.png";
import githubIcon from "../assets/icons/social-github.png";
import behanceIcon from "../assets/icons/social-behance.png";
import linktreeIcon from "../assets/icons/social-linktree.png";
import type { MemberProps } from "../types/props/MemberProps";

export const teamMembers: MemberProps[] = [
    {
        name: "Mazen Mohsen",
        title: "Computer Engineer",
        role: "Full Stack Developer",
        university: "Cairo University",
        badge: "Founder & Team Lead",
        image: mazenMohsenImg,
        socials: [
            { icon: websiteIcon, url: "https://www.mazen4dev.vercel.app" },
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mazenmohsen15/",
            },
            {
                icon: githubIcon,
                url: "https://github.com/Mazen91235",
            },
        ],
    },
    {
        name: "Omar Magdy",
        title: "Computer Engineer",
        role: "Backend Developer",
        additionalRoles: [{ name: "Frontend Developer", type: "sprint" }],
        university: "Cairo University",
        image: omarMagdyImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/omarbadawy11",
            },
            { icon: githubIcon, url: "https://github.com/omarmagdy-b" },
        ],
    },
    {
        name: "Omar Nagy",
        title: "Computer Engineer",
        role: "Backend Developer",
        additionalRoles: [
            { name: "Frontend Developer", type: "sprint" },
            { name: "Software Tester", type: "secondary" },
        ],
        university: "Cairo University",
        image: omarNagyImg,
        imagePosition: "top",
        socials: [
            {
                icon: websiteIcon,
                url: " https://omar-nagy-portfolio.vercel.app",
            },
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/omar-nagy-work",
            },
            { icon: githubIcon, url: "https://github.com/bradocola" },
        ],
    },
    {
        name: "Mariam Sameh",
        title: "Computer Engineer",
        role: "Backend Developer",
        additionalRoles: [
            {
                name: "Software Tester",
                type: "secondary",
            },
        ],
        university: "Cairo University",
        image: mariamSamehImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mariam-sameh-1b726a335",
            },
            { icon: githubIcon, url: "https://github.com/Mariam-Sameh17" },
        ],
    },
    {
        name: "Habiba Mahmoud",
        title: "Computer Engineer",
        role: "Backend Developer",
        university: "Cairo University",
        image: habibaMahmoudImg,
        imagePosition: "top",
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/habiba-mahmoud-10aa2a2a2",
            },
            { icon: githubIcon, url: "https://github.com/HabibaMahmoud2005" },
        ],
    },
    {
        name: "Rojan Hamdy",
        title: "Computer Engineer",
        role: "Backend Developer",
        university: "Cairo University",
        image: rojanHamdyImg,
        imagePosition: "bottom",
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/rojan-hamdy-8a4683397",
            },
            { icon: githubIcon, url: "https://github.com/rojan-hamdy" },
        ],
    },
    {
        name: "Mohamed Ahmed",
        title: "Computer Engineer",
        role: "Frontend Developer",
        university: "Cairo University",
        badge: "Former Partner",
        image: mohamedAhmedImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mohamed-ahmed-04b5b8380",
            },
            { icon: githubIcon, url: "https://github.com/Mohamed-ahmed-2006" },
        ],
    },
    {
        name: "Anne Omer",
        title: "Computer Engineer",
        role: "Frontend Developer",
        university: "Cairo University",
        image: anneOmerImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/anne-omer-6211b0310",
            },
            { icon: githubIcon, url: "https://github.com/AnneOmer05" },
        ],
    },
    {
        name: "Mariam Mohamed",
        title: "Computer Engineer",
        role: "Frontend Developer",
        university: "Cairo University",
        image: mariamMohamedImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/mariam-mohamed-923025335",
            },
            { icon: githubIcon, url: "https://github.com/mariamramadan0306" },
        ],
    },
    {
        name: "Abdelrhman Mohamed",
        title: "Communication Engineer",
        role: "Frontend Developer",
        university: "Cairo University",
        image: abdelrhmanMohamedImg,
        imagePosition: "bottom",
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/abdelrhman-mohamed-93099931b",
            },
            { icon: githubIcon, url: "https://github.com/abdelrhman-sys" },
        ],
    },
    {
        name: "Yasmin Tharwat",
        title: "Software Engineer",
        role: "Frontend Developer",
        university: "South Valley University",
        image: yasmineTharwatImg,
        socials: [
            { icon: linktreeIcon, url: "https://linktr.ee/Yasmin_Tharwat" },
        ],
    },
    {
        name: "Jana Nour",
        title: "Biomedical Engineer",
        role: "Frontend Developer",
        university: "Cairo University",
        image: janaNourImg,
        imagePosition: "top",
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/jana-nour-1510bb324",
            },
            { icon: githubIcon, url: "https://github.com/jananour00" },
        ],
    },
    {
        name: "Nayra Samy",
        title: "Faculty of Arts",
        role: "UI/UX Designer",
        university: "Ain Shams University",
        image: nayraSamyImg,
        imagePosition: "top",
        socials: [
            {
                icon: behanceIcon,
                url: " https://www.behance.net/nayrasamy2",
            },
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/nayra-samy-b323641b3",
            },
        ],
    },
    {
        name: "Hadeer Khalil",
        title: "Faculty of Commerce",
        role: "UI/UX Designer",
        university: "MIS department",
        image: hadeerKhalilImg,
        imagePosition: "top",
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/hadeer-khalil-uiuxcx",
            },
        ],
    },
    {
        name: "Somia Ali",
        title: "Kindergarten",
        role: "UI/UX Designer",
        university: "Al-Azhar University",
        image: somiaAliImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/somialiui",
            },
        ],
    },
    {
        name: "Marwa Mohamed",
        title: "Commerce English Sector",
        role: "UI/UX Designer",
        university: "cairo university",
        image: marwaMohamedImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/marwa-mohamed-8565b5222",
            },
        ],
    },
    {
        name: "Jasmine Ismail",
        title: "Computer Engineer",
        role: "Software Tester",
        university: "Cairo University",
        image: jasmineIsmailImg,
        socials: [
            {
                icon: linkedinIcon,
                url: "https://www.linkedin.com/in/jasmine-ismailx6",
            },
            {
                icon: githubIcon,
                url: "https://github.com/jasminex6",
            },
        ],
    },
];
