export type SocialLink = {
    icon: string;
    url: string;
};

export const memberRoles = [
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Software Tester",
] as const;

export type MemberProps = {
    name: string;
    title: string;
    role: typeof memberRoles[number];
    university: string;
    badge?: string;
    image: string;
    socials: SocialLink[];
};
