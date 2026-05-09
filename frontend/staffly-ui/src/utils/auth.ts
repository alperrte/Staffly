import { jwtDecode } from "jwt-decode";

type JwtPayload = {
    roles?: string[] | string;
    authorities?: string[] | string;
    role?: string;
    userId?: number | string;
    sub?: string;
    email?: string;
};

export const ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
export const ROLE_HR_MANAGER = "ROLE_HR_MANAGER";
export const ROLE_DEPARTMENT_MANAGER = "ROLE_DEPARTMENT_MANAGER";
export const ROLE_MANAGER = "ROLE_MANAGER";
export const ROLE_EMPLOYEE = "ROLE_EMPLOYEE";
export const ROLE_ACCOUNTING = "ROLE_ACCOUNTING";

export const normalizeRole = (role: string) => {
    if (!role) return role;
    return role.startsWith("ROLE_") ? role : `ROLE_${role}`;
};

export const getToken = () => localStorage.getItem("token");

export const getTokenRoles = (): string[] => {
    const token = getToken();
    if (!token) return [];

    try {
        const decoded = jwtDecode<JwtPayload>(token as string);
        const rawRoles = decoded.roles ?? decoded.authorities ?? decoded.role ?? [];
        const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

        return rolesArray.filter(Boolean).map((r) => normalizeRole(String(r)));
    } catch {
        return [];
    }
};

export const getTokenUserId = (): number | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode<JwtPayload>(token as string);
        const raw = decoded.userId;
        if (raw == null) return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export const hasAnyRole = (allowedRoles: string[]) => {
    const roles = getTokenRoles();
    return roles.some((role) => allowedRoles.includes(role));
};
