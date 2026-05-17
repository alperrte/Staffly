import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./MainSideBar";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
    ROLE_DEPARTMENT_MANAGER,
    ROLE_EMPLOYEE,
    ROLE_HR_MANAGER,
    ROLE_MANAGER,
    ROLE_SYSTEM_ADMIN,
    ROLE_ACCOUNTING,
    hasAnyRole,
} from "../utils/auth";

const decodeJwtPayload = (token: string) => {
    const payload = token.split(".")[1];

    if (!payload) {
        throw new Error("Invalid token payload");
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    return JSON.parse(atob(padded));
};

const searchablePages = [
    {
        label: "Çalışanlar",
        path: "/app/employees",
        keywords: ["çalışan", "personel", "employee"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER],
    },
    {
        label: "Kullanıcılar",
        path: "/app/users",
        keywords: ["kullanıcı", "user", "hesap"],
        roles: [ROLE_SYSTEM_ADMIN],
    },
    {
        label: "Başvurular",
        path: "/app/applications",
        keywords: ["başvuru", "cv", "aday"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER],
    },
    {
        label: "İş İlanları",
        path: "/app/job-postings",
        keywords: ["ilan", "iş ilanı"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER],
    },
    {
        label: "Görevler",
        path: "/app/tasks",
        keywords: ["görev", "task"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
        ],
    },
    {
        label: "Görevlerim",
        path: "/app/tasks/mytasks",
        keywords: ["görevlerim", "my task"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Maaş Takibi",
        path: "/app/payroll/salary-tracking",
        keywords: ["maaş", "bordro", "payroll", "avans"],
        roles: [ROLE_EMPLOYEE],
    },
    {
        label: "Avans Talepleri",
        path: "/app/payroll/advance-requests",
        keywords: ["avans", "talep", "onay", "red"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING],
    },
    {
        label: "Maaş Ataması",
        path: "/app/payroll/salary-assignment",
        keywords: ["maaş", "atama", "bonus", "kesinti"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING],
    },
    {
        label: "İzin Talepleri",
        path: "/app/leaveService",
        keywords: ["izin", "leave"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Çalışma Takvimi",
        path: "/app/work-schedules",
        keywords: ["çalışma", "takvim", "mesai"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER],
    },
    {
        label: "Toplantı Planlama",
        path: "/app/meetings",
        keywords: ["toplantı", "meeting"],
        roles: [ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER],
    },
    {
        label: "Takvimim",
        path: "/app/my-schedule",
        keywords: ["takvimim", "programım"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Ulaşım",
        path: "/app/transport",
        keywords: ["ulaşım", "servis"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Profil",
        path: "/app/profile",
        keywords: ["profil", "profile"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Ayarlar",
        path: "/app/settings",
        keywords: ["ayar", "settings"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
    {
        label: "Destek",
        path: "/app/support",
        keywords: ["destek", "support", "ticket"],
        roles: [
            ROLE_SYSTEM_ADMIN,
            ROLE_HR_MANAGER,
            ROLE_DEPARTMENT_MANAGER,
            ROLE_MANAGER,
            ROLE_EMPLOYEE,
        ],
    },
];

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [search, setSearch] = useState("");

    const isDashboard = location.pathname === "/app";

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const payload = decodeJwtPayload(token);
            setEmail(payload.sub || payload.email || "User");
        } catch {
            navigate("/login");
        }
    }, [navigate]);

    const filteredPages = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) return [];

        return searchablePages.filter((page) => {
            if (page.roles && !hasAnyRole(page.roles)) {
                return false;
            }

            const labelMatch = page.label.toLowerCase().includes(value);
            const keywordMatch = page.keywords.some((keyword) =>
                keyword.toLowerCase().includes(value)
            );

            return labelMatch || keywordMatch;
        });
    }, [search]);

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && filteredPages.length > 0) {
            navigate(filteredPages[0].path);
            setSearch("");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617] text-white">
            <Sidebar />

            <div className="relative min-w-0 flex h-full flex-1 flex-col overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-70">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.22),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.24),transparent_42%)]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                    {isDashboard && (
                        <header className="relative z-50 mb-4 flex shrink-0 items-center justify-between gap-6 rounded-3xl border border-white/10 bg-slate-950/55 px-5 py-4 shadow-[0_0_35px_rgba(15,23,42,0.75)] backdrop-blur-2xl">
                            <div className="relative hidden w-full max-w-2xl md:block">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    type="text"
                                    placeholder="Panel ara... Örn: çalışan, izin, görev"
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/20"
                                />

                                {filteredPages.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[9999] max-h-[360px] overflow-y-auto rounded-2xl border border-sky-400/20 bg-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                                        {filteredPages.map((page) => (
                                            <button
                                                key={page.path}
                                                type="button"
                                                onClick={() => {
                                                    navigate(page.path);
                                                    setSearch("");
                                                }}
                                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-sky-500/10 hover:text-white"
                                            >
                                                <span>{page.label}</span>
                                                <span className="text-xs text-sky-300">
                                                    Git
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="ml-auto flex items-center gap-4">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs transition hover:border-sky-400/60 hover:bg-slate-900"
                                >
                                    <span className="max-w-[170px] truncate text-slate-100">
                                        {email || "User"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-slate-300" />
                                </button>
                            </div>
                        </header>
                    )}

                    <main className="staffly-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
                        <div className="min-h-full w-full">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;