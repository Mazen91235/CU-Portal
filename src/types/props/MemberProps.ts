export type SocialLink = {
    icon: string;
    url: string;
};

export const memberRoles = [
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "UI/UX Designer",
    "Software Tester",
] as const;

export type AdditionalRole = {
    name: string;
    type?: "secondary" | "sprint";
};

export type MemberProps = {
    name: string;
    title: string;
    role: (typeof memberRoles)[number];
    additionalRoles?: AdditionalRole[];
    university: string;
    badge?: string;
    image: string;
    imagePosition?: string;
    socials: SocialLink[];
};
