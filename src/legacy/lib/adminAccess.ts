const ALLOWED_ADMIN_EMAILS = [
    "mariame@ryamchouu.com",
    "tunde@ryamchouu.com",
    "gamesandconnectgh@gmail.com",
];

export const isAllowedAdminEmail = (email?: string | null) => {
    if (!email) return false;
    return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
