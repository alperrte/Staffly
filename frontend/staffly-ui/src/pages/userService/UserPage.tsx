import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
    FaCheck,
    FaChevronDown,
    FaEllipsisH,
    FaEnvelope,
    FaFilter,
    FaInfo,
    FaPaperPlane,
    FaSearch,
    FaShieldAlt,
    FaTimes,
    FaUserCheck,
    FaUserPlus,
    FaUserShield,
    FaUserSlash,
    FaUsers,
} from "react-icons/fa";
import {
    createUser,
    getEmployeesForUserCreation,
    getRoles,
    getUsers,
    setUserActive,
    setUserRoles,
} from "../../services/userService";
import type { Role, User } from "../../services/userService";

type StatusFilter = "ALL" | "ACTIVE" | "PASSIVE";
type SettingsTab = "MEMBERSHIP" | "PERMISSIONS";

type ConfirmKind =
    | { type: "CREATE_USER"; email: string; employeeId: number; roleNames: string[] }
    | { type: "UPDATE_ACTIVE"; email: string; active: boolean }
    | { type: "UPDATE_ROLES"; email: string; roles: string[] }
    | null;

type UserWithOptionalName = User & {
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
};

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    departmentId?: number;
    positionName?: string;
};

const UserPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createRoleNames, setCreateRoleNames] = useState<string[]>(["EMPLOYEE"]);
    const [isCreating, setIsCreating] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
    const [settingsOpenForEmail, setSettingsOpenForEmail] = useState<string | null>(null);
    const [settingsTab, setSettingsTab] = useState<SettingsTab>("MEMBERSHIP");

    const [activeDraft, setActiveDraft] = useState<boolean>(true);
    const [roleDraft, setRoleDraft] = useState<string[]>([]);
    const [roleSearch, setRoleSearch] = useState("");

    const [areRolesLoading, setAreRolesLoading] = useState(false);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
    const [confirmStage, setConfirmStage] = useState<"form" | "loading" | "success">("form");
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const listRef = useRef<HTMLDivElement | null>(null);

    const employeeNameById = useMemo(
        () =>
            new Map(
                employees.map((employee) => [
                    employee.id,
                    `${employee.firstName} ${employee.lastName}`.trim(),
                ])
            ),
        [employees]
    );

    const getDisplayName = (user: User) => {
        const linkedEmployeeName =
            typeof user.employeeId === "number" ? employeeNameById.get(user.employeeId) : null;

        if (linkedEmployeeName) {
            return linkedEmployeeName;
        }

        const u = user as UserWithOptionalName;

        if (u.fullName?.trim()) return u.fullName.trim();
        if (u.name?.trim()) return u.name.trim();

        const first = u.firstName?.trim() ?? "";
        const last = u.lastName?.trim() ?? "";
        const full = `${first} ${last}`.trim();

        return full || "İsim bilgisi yok";
    };

    const eligibleEmployees = useMemo(() => {
        const assignedEmployeeIds = new Set(
            users
                .map((user) => user.employeeId)
                .filter((employeeId): employeeId is number => typeof employeeId === "number")
        );

        return employees
            .filter((employee) => employee.status?.toUpperCase() === "ACTIVE")
            .filter((employee) => !assignedEmployeeIds.has(employee.id))
            .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                    `${b.firstName} ${b.lastName}`,
                    "tr"
                )
            );
    }, [employees, users]);

    const selectedEmployee = useMemo(
        () => eligibleEmployees.find((employee) => employee.id === selectedEmployeeId) ?? null,
        [eligibleEmployees, selectedEmployeeId]
    );

    const currentUser = useMemo(() => {
        if (!settingsOpenForEmail) return null;
        return users.find((u) => u.email === settingsOpenForEmail) ?? null;
    }, [settingsOpenForEmail, users]);

    const roleFilterOptions = useMemo(() => {
        const fromUsers = users.flatMap((u) => (u.roles ?? []).map((r) => r.name));
        return Array.from(new Set(fromUsers)).sort((a, b) => a.localeCompare(b));
    }, [users]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const result = users.filter((u) => {
            const name = getDisplayName(u).toLowerCase();
            const email = u.email.toLowerCase();

            const matchesQuery = q.length === 0 || email.includes(q) || name.includes(q);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && u.active) ||
                (statusFilter === "PASSIVE" && !u.active);

            const userRoleNames = (u.roles ?? []).map((r) => r.name);
            const matchesRole = roleFilter === "ALL" || userRoleNames.includes(roleFilter);

            return matchesQuery && matchesStatus && matchesRole;
        });

        if (statusFilter === "ALL") {
            result.sort((a, b) => Number(b.active) - Number(a.active));
        }

        return result;
    }, [users, searchQuery, statusFilter, roleFilter, employeeNameById]);

    const counts = useMemo(() => {
        const active = users.filter((u) => u.active).length;
        const passive = users.length - active;

        return {
            total: users.length,
            active,
            passive,
        };
    }, [users]);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const fetchAllRoles = async () => {
        setAreRolesLoading(true);

        try {
            const data = await getRoles();
            setRoles(data);
        } finally {
            setAreRolesLoading(false);
        }
    };

    const fetchEmployees = async () => {
        const data = await getEmployeesForUserCreation();
        setEmployees(data);
    };

    useEffect(() => {
        fetchUsers().catch((error) => console.error("Kullanıcıları alma hatası:", error));
        fetchEmployees().catch((error) => console.error("Çalışanları alma hatası:", error));
    }, []);

    useEffect(() => {
        if (!settingsOpenForEmail) return;

        const u = users.find((x) => x.email === settingsOpenForEmail);

        setActiveDraft(!!u?.active);
        setRoleDraft(u?.roles?.map((r) => r.name) ?? []);
        setRoleSearch("");

        if (roles.length === 0) {
            fetchAllRoles().catch((error) => console.error("Rolleri alma hatası:", error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsOpenForEmail]);

    useEffect(() => {
        if (!isConfirmOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeConfirm();
        };

        document.addEventListener("keydown", onKeyDown);

        return () => document.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConfirmOpen]);

    const goToListWithFilter = (nextStatus: StatusFilter) => {
        setStatusFilter(nextStatus);

        setTimeout(() => {
            listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    const openCreateModal = () => {
        setCreateRoleNames(["EMPLOYEE"]);
        setSelectedEmployeeId("");
        setIsCreating(false);
        setIsCreateOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateOpen(false);
        setEmployeeDropdownOpen(false);
        setDropdownOpen(false);
    };

    const openSettings = (email: string) => {
        setSettingsOpenForEmail(email);
        setSettingsTab("MEMBERSHIP");
    };

    const closeSettings = () => {
        setSettingsOpenForEmail(null);
        setSettingsTab("MEMBERSHIP");
    };

    const startConfirm = (kind: ConfirmKind) => {
        setConfirmKind(kind);
        setConfirmError(null);
        setConfirmStage("form");
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => {
        setIsConfirmOpen(false);
        setConfirmKind(null);
        setConfirmStage("form");
        setConfirmError(null);
    };

    const confirmYes = async () => {
        if (!confirmKind) return;

        setConfirmStage("loading");
        setConfirmError(null);

        try {
            if (confirmKind.type === "CREATE_USER") {
                setIsCreating(true);

                await createUser({
                    employeeId: confirmKind.employeeId,
                    roleNames: confirmKind.roleNames,
                });

                await fetchUsers();
                setIsCreateOpen(false);
            } else if (confirmKind.type === "UPDATE_ACTIVE") {
                await setUserActive(confirmKind.email, confirmKind.active);
                await fetchUsers();
            } else if (confirmKind.type === "UPDATE_ROLES") {
                await setUserRoles(confirmKind.email, confirmKind.roles);
                await fetchUsers();
            }

            setConfirmStage("success");
        } catch (e) {
            console.error(e);
            setConfirmStage("form");
            setConfirmError("İşlem başarısız oldu. Lütfen tekrar deneyin.");
        } finally {
            setIsCreating(false);
        }
    };

    const onSubmitCreate = (e: FormEvent) => {
        e.preventDefault();

        if (!selectedEmployee || createRoleNames.length === 0) return;

        startConfirm({
            type: "CREATE_USER",
            email: selectedEmployee.email,
            roleNames: createRoleNames,
            employeeId: selectedEmployee.id,
        });
    };

    const activeHasChanged = useMemo(() => {
        if (!currentUser) return false;
        return currentUser.active !== activeDraft;
    }, [currentUser, activeDraft]);

    const currentRoleNames = useMemo(() => {
        return currentUser?.roles?.map((r) => r.name) ?? [];
    }, [currentUser]);

    const rolesHasChanged = useMemo(() => {
        const a = [...currentRoleNames].sort().join("|");
        const b = [...roleDraft].sort().join("|");

        return a !== b;
    }, [currentRoleNames, roleDraft]);

    const updateActiveDraft = () => {
        if (!currentUser) return;

        startConfirm({
            type: "UPDATE_ACTIVE",
            email: currentUser.email,
            active: activeDraft,
        });
    };

    const updateRolesDraft = () => {
        if (!currentUser) return;

        startConfirm({
            type: "UPDATE_ROLES",
            email: currentUser.email,
            roles: roleDraft,
        });
    };

    const onSelectEmployee = (employeeIdValue: string) => {
        if (!employeeIdValue) {
            setSelectedEmployeeId("");
            return;
        }

        const employeeId = Number(employeeIdValue);
        setSelectedEmployeeId(employeeId);
    };

    const toggleRole = (roleName: string) => {
        setRoleDraft((prev) => {
            const exists = prev.includes(roleName);

            if (exists) return prev.filter((r) => r !== roleName);

            return [...prev, roleName];
        });
    };

    const filteredRoles = useMemo(() => {
        const q = roleSearch.trim().toLowerCase();

        if (!q) return roles;

        return roles.filter((r) => r.name.toLowerCase().includes(q));
    }, [roles, roleSearch]);

    const cardGrid =
        "grid grid-cols-1 lg:grid-cols-[1.15fr_1.25fr_0.85fr_1fr_72px] gap-4 items-center";

    return (
        <div className="min-h-screen bg-[#020817] px-8 py-8 text-white">
            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.35)]">
                        <FaUsers className="text-2xl text-white" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-white">
                            Kullanıcı Yönetimi
                        </h1>
                        <p className="mt-2 text-base text-slate-300">
                            Kullanıcıları görüntüleyebilir, durumlarını ve yetkilerini yönetebilirsiniz.
                        </p>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-8 text-base font-semibold text-white shadow-[0_0_40px_rgba(6,182,212,0.25)] transition hover:scale-[1.015] hover:shadow-[0_0_60px_rgba(6,182,212,0.4)] active:scale-[0.99]"
                >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                    <FaUserPlus className="text-sm" />
                </span>
                    Yeni Kullanıcı
                </button>
            </div>

            {/* STATS */}
            <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-3">
                {[
                    {
                        label: "Toplam Kullanıcı",
                        value: counts.total,
                        description: "Sistemde kayıtlı toplam kullanıcı",
                        icon: FaUsers,
                        color: "blue",
                        filter: "ALL" as StatusFilter,
                    },
                    {
                        label: "Aktif Kullanıcılar",
                        value: counts.active,
                        description: "Sisteme erişimi açık kullanıcılar",
                        icon: FaUserCheck,
                        color: "emerald",
                        filter: "ACTIVE" as StatusFilter,
                    },
                    {
                        label: "Pasif Kullanıcılar",
                        value: counts.passive,
                        description: "Sisteme erişimi kapalı kullanıcılar",
                        icon: FaUserSlash,
                        color: "rose",
                        filter: "PASSIVE" as StatusFilter,
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    const styles = {
                        blue: {
                            card: "border-blue-400/25 bg-blue-500/10",
                            icon: "bg-blue-500/15 text-blue-300 shadow-[0_0_32px_rgba(37,99,235,0.28)]",
                            text: "text-blue-200",
                            arrow: "bg-blue-500/15 text-blue-300",
                        },
                        emerald: {
                            card: "border-emerald-400/25 bg-emerald-500/10",
                            icon: "bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(16,185,129,0.22)]",
                            text: "text-emerald-200",
                            arrow: "bg-emerald-500/15 text-emerald-300",
                        },
                        rose: {
                            card: "border-rose-400/25 bg-rose-500/10",
                            icon: "bg-rose-500/15 text-rose-300 shadow-[0_0_32px_rgba(244,63,94,0.18)]",
                            text: "text-rose-200",
                            arrow: "bg-rose-500/15 text-rose-300",
                        },
                    }[item.color as "blue" | "emerald" | "rose"];

                    const isActive = statusFilter === item.filter;

                    return (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => goToListWithFilter(item.filter)}
                            className={`rounded-2xl border p-5 text-left transition ${
                                styles.card
                            } ${
                                isActive
                                    ? "ring-1 ring-white/20"
                                    : "hover:border-white/20 hover:bg-white/[0.04]"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${styles.icon}`}>
                                        <Icon className="text-3xl" />
                                    </div>

                                    <div>
                                        <p className={`text-sm font-bold ${styles.text}`}>
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-3xl font-extrabold text-white">
                                            {item.value}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* FILTERS */}
            <div className="mb-10 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-6 shadow-[0_0_30px_rgba(59,130,246,0.06)] backdrop-blur-xl">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.7fr_0.7fr]">
                    <div className="relative">
                        <FaSearch className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                        <input
                            type="text"
                            placeholder="E-posta veya isim ile ara"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-16 w-full rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 pl-16 pr-5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60"
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="h-16 w-full appearance-none rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 pl-16 pr-12 text-base text-slate-200 outline-none transition focus:border-cyan-500/60"
                        >
                            <option value="ALL">Tüm Durumlar</option>
                            <option value="ACTIVE">Sadece Aktif</option>
                            <option value="PASSIVE">Sadece Pasif</option>
                        </select>
                        <FaChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="relative">
                        <FaShieldAlt className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="h-16 w-full appearance-none rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 pl-16 pr-12 text-base text-slate-200 outline-none transition focus:border-cyan-500/60"
                        >
                            <option value="ALL">Tüm Yetkiler</option>
                            {roleFilterOptions.map((roleName) => (
                                <option key={roleName} value={roleName}>
                                    {roleName}
                                </option>
                            ))}
                        </select>
                        <FaChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div
                ref={listRef}
                className="overflow-hidden rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-3 shadow-[0_0_30px_rgba(59,130,246,0.06)] backdrop-blur-xl"
            >
                <div className={`hidden lg:grid ${cardGrid} border-b border-white/10 px-5 py-5`}>
                    <div className="inline-flex items-center gap-3 text-sm font-bold text-slate-300">
                        <FaUsers className="text-slate-300" />
                        Ad Soyad
                    </div>

                    <div className="inline-flex items-center gap-3 text-sm font-bold text-slate-300">
                        <FaEnvelope className="text-slate-300" />
                        E-posta
                    </div>

                    <div className="inline-flex items-center justify-center gap-3 text-sm font-bold text-slate-300">
                        <FaCheck className="text-slate-300" />
                        Üyelik Durumu
                    </div>

                    <div className="inline-flex items-center justify-center gap-3 text-sm font-bold text-slate-300">
                        <FaShieldAlt className="text-slate-300" />
                        Yetkiler
                    </div>

                    <div className="justify-self-center text-sm font-bold text-slate-300">
                        İşlem
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                        Filtreye uygun kullanıcı bulunamadı.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-800/40 bg-[#0f172a]/65">
                        {filteredUsers.map((user, index) => {
                            const displayName = getDisplayName(user);
                            const initial = displayName !== "İsim bilgisi yok"
                                ? displayName.charAt(0).toUpperCase()
                                : user.email.charAt(0).toUpperCase();

                            const avatarColors = [
                                "from-purple-600 to-fuchsia-500",
                                "from-blue-600 to-indigo-500",
                                "from-amber-600 to-yellow-500",
                                "from-teal-600 to-emerald-500",
                                "from-cyan-700 to-teal-500",
                            ];

                            return (
                                <div
                                    key={user.email}
                                    className={`${cardGrid} border-b border-white/8 px-5 py-4 last:border-b-0 transition hover:bg-white/[0.045]`}
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-lg font-extrabold text-white shadow-[0_8px_22px_rgba(0,0,0,0.28)]`}
                                        >
                                            {initial}
                                        </div>

                                        <div className="min-w-0">
                                            {displayName === "İsim bilgisi yok" ? (
                                                <span className="text-sm italic text-slate-500">
                                                İsim bilgisi yok
                                            </span>
                                            ) : (
                                                <span className="block truncate text-base font-medium text-white">
                                                {displayName}
                                            </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="inline-flex min-w-0 items-center gap-3 text-base text-white/90">
                                        <FaEnvelope className="shrink-0 text-xl text-slate-500" />
                                        <span className="truncate">{user.email}</span>
                                    </div>

                                    <div className="flex justify-center">
                                        {user.active ? (
                                            <span className="inline-flex items-center gap-3 rounded-lg border border-emerald-400/25 bg-emerald-500/14 px-4 py-2 text-sm font-bold text-emerald-200">
                                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                                            Üyelik Açık
                                        </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-3 rounded-lg border border-rose-400/25 bg-rose-500/14 px-4 py-2 text-sm font-bold text-rose-200">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(251,113,133,0.9)]" />
                                            Üyelik Kapalı
                                        </span>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        {user.roles?.length ? (
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {user.roles.map((r) => {
                                                    const isDepartment = r.name.includes("DEPARTMENT");
                                                    const isEmployee = r.name.includes("EMPLOYEE");
                                                    const roleClass = isDepartment
                                                        ? "border-purple-400/35 bg-purple-500/14 text-purple-300"
                                                        : isEmployee
                                                            ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-300"
                                                            : "border-blue-400/35 bg-blue-500/12 text-blue-300";

                                                    return (
                                                        <span
                                                            key={r.name}
                                                            className={`inline-flex items-center rounded-lg border px-4 py-2 text-xs font-extrabold ${roleClass}`}
                                                        >
                                                        {r.name}
                                                    </span>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">Yetki yok</span>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => openSettings(user.email)}
                                            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 text-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200"
                                            aria-label="Ayarlar"
                                        >
                                            <FaEllipsisH className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col gap-4 px-5 py-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
                    <div className="inline-flex items-center gap-3">
                        <FaUsers className="text-slate-500" />
                        {filteredUsers.length} kullanıcıdan 1–{filteredUsers.length} arası gösteriliyor
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button className="flex h-11 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400">
                            ‹
                        </button>
                        <button className="flex h-11 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-bold text-white shadow-[0_10px_24px_rgba(34,211,238,0.24)]">
                            1
                        </button>
                        <button className="flex h-11 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400">
                            ›
                        </button>
                    </div>

                    <div className="inline-flex items-center gap-4">
                        <span>Sayfa başına</span>
                        <button className="inline-flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-white">
                            10
                            <FaChevronDown className="text-xs text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SETTINGS MODAL */}
            {settingsOpenForEmail && currentUser && (
                <div
                    className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeSettings();
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(6,11,23,0.98),rgba(2,6,23,0.98))] shadow-[0_34px_100px_rgba(0,0,0,0.65)]">
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-7">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_30px_rgba(34,211,238,0.24)]">
                                    <FaUserShield className="text-3xl text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Kullanıcı Düzenle</div>
                                    <div className="mt-1 text-2xl font-extrabold text-white">
                                        {currentUser.email}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeSettings}
                                className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-white/5 hover:text-white"
                                aria-label="Kapat"
                            >
                                <FaTimes />
                                Kapat
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-112px)] overflow-auto p-7 staffly-scroll">
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("MEMBERSHIP")}
                                    className={`h-14 rounded-2xl border text-sm font-bold transition ${
                                        settingsTab === "MEMBERSHIP"
                                            ? "border-cyan-400/45 bg-cyan-500/12 text-white shadow-[0_0_0_4px_rgba(34,211,238,0.10)]"
                                            : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                                    }`}
                                >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FaUserCheck />
                                    Üyelik Aç / Kapat
                                </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("PERMISSIONS")}
                                    className={`h-14 rounded-2xl border text-sm font-bold transition ${
                                        settingsTab === "PERMISSIONS"
                                            ? "border-cyan-400/45 bg-cyan-500/12 text-white shadow-[0_0_0_4px_rgba(34,211,238,0.10)]"
                                            : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                                    }`}
                                >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FaShieldAlt />
                                    Yetki Değiştir
                                </span>
                                </button>
                            </div>

                            {settingsTab === "MEMBERSHIP" && (
                                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                                    <div className="mb-4 text-base text-slate-300">
                                        Kullanıcının giriş üyeliğini açıp kapatabilirsiniz.
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDraft(true)}
                                            className={`h-14 rounded-2xl border text-sm font-bold transition ${
                                                activeDraft
                                                    ? "border-emerald-400/50 bg-emerald-500/18 text-emerald-100"
                                                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                                            }`}
                                        >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <FaUserCheck />
                                            Üyelik Açık
                                        </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setActiveDraft(false)}
                                            className={`h-14 rounded-2xl border text-sm font-bold transition ${
                                                !activeDraft
                                                    ? "border-rose-400/50 bg-rose-500/18 text-rose-100"
                                                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                                            }`}
                                        >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <FaUserSlash />
                                            Üyelik Kapalı
                                        </span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={updateActiveDraft}
                                        disabled={!activeHasChanged || isConfirmOpen}
                                        className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-sm font-bold text-white shadow-[0_14px_32px_rgba(34,211,238,0.22)] transition hover:shadow-[0_0_36px_rgba(34,211,238,0.34)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Üyelik Durumunu Kaydet
                                    </button>

                                    {!activeHasChanged && (
                                        <div className="mt-3 text-xs text-slate-400">Değişiklik yok.</div>
                                    )}
                                </div>
                            )}

                            {settingsTab === "PERMISSIONS" && (
                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                    <div className="h-fit rounded-[22px] border border-white/10 bg-white/[0.04] p-5 xl:col-span-1">
                                        <div className="mb-3 text-base font-bold text-slate-200">
                                            Seçili Yetkiler
                                        </div>

                                        {roleDraft.length === 0 ? (
                                            <div className="text-sm text-slate-400">
                                                Henüz yetki seçilmedi.
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {roleDraft.map((rn) => (
                                                    <button
                                                        key={rn}
                                                        type="button"
                                                        onClick={() => toggleRole(rn)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-500/12 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/18"
                                                        aria-label={`${rn} yetkisini kaldır`}
                                                    >
                                                        <FaShieldAlt />
                                                        {rn}
                                                        <FaTimes />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={updateRolesDraft}
                                            disabled={!rolesHasChanged || isConfirmOpen}
                                            className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-sm font-bold text-white shadow-[0_14px_32px_rgba(34,211,238,0.22)] transition hover:shadow-[0_0_36px_rgba(34,211,238,0.34)] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Yetkileri Kaydet
                                        </button>

                                        {!rolesHasChanged && (
                                            <div className="mt-3 text-xs text-slate-400">Değişiklik yok.</div>
                                        )}
                                    </div>

                                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 xl:col-span-2">
                                        <div className="mb-3 text-base font-bold text-slate-200">
                                            Yetkiler
                                        </div>

                                        <div className="relative mb-4">
                                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Yetki ara..."
                                                value={roleSearch}
                                                onChange={(e) => setRoleSearch(e.target.value)}
                                                className="h-14 w-full rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60"
                                            />
                                        </div>

                                        {areRolesLoading ? (
                                            <div className="text-sm text-slate-400">Yetkiler yükleniyor...</div>
                                        ) : filteredRoles.length === 0 ? (
                                            <div className="text-sm text-slate-400">Uygun yetki bulunamadı.</div>
                                        ) : (
                                            <div className="grid max-h-[360px] grid-cols-1 gap-2 overflow-auto pr-1 staffly-scroll">
                                                {filteredRoles.map((role) => {
                                                    const selected = roleDraft.includes(role.name);

                                                    return (
                                                        <button
                                                            key={role.name}
                                                            type="button"
                                                            onClick={() => toggleRole(role.name)}
                                                            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                                                selected
                                                                    ? "border-cyan-400/40 bg-cyan-500/12 text-white"
                                                                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                            <span
                                                                className={`h-3 w-3 rounded-full ${
                                                                    selected ? "bg-blue-300" : "bg-slate-600"
                                                                }`}
                                                            />
                                                                <div>
                                                                    <div className="font-bold">{role.name}</div>
                                                                    {role.description ? (
                                                                        <div className="mt-1 text-xs text-slate-400">
                                                                            {role.description}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            {selected ? (
                                                                <FaCheck className="text-blue-200" />
                                                            ) : null}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md">
                    <div className="w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(6,11,23,0.98),rgba(2,6,23,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.62)]">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-7">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_28px_rgba(34,211,238,0.24)]">
                                    <FaUserShield className="text-2xl text-white" />
                                </div>

                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
                                        Erişim Yönetimi
                                    </div>
                                    <h3 className="mt-1 text-2xl font-semibold text-white">
                                    Kullanıcı Yetkisi Ver
                                    </h3>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                            >
                                <FaTimes className="text-base" />
                            </button>
                        </div>

                        <form onSubmit={onSubmitCreate} className="space-y-4 px-6 py-6 md:px-7">
                            <div
                                className={`relative rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl ${
                                    employeeDropdownOpen ? "z-30" : "z-0"
                                }`}
                            >
                                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                    1. Aktif çalışan seç
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                                        className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white outline-none transition hover:border-cyan-400/40 hover:bg-white/[0.07]"
                                    >
                                    <span className="inline-flex min-w-0 items-center gap-3">
                                        <FaSearch className="shrink-0 text-sm text-slate-400" />
                                        <span className={selectedEmployee ? "truncate text-white" : "truncate text-slate-500"}>
                                            {selectedEmployee
                                                ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                                                : "Kullanıcı yetkisi verilecek çalışanı seç"}
                                        </span>
                                    </span>
                                        <FaChevronDown className="shrink-0 text-slate-400" />
                                    </button>

                                    {employeeDropdownOpen && (
                                        <div className="absolute left-0 top-full z-[80] mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.55)] staffly-scroll">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelectEmployee("");
                                                    setEmployeeDropdownOpen(false);
                                                }}
                                                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-cyan-500/10 hover:text-white"
                                            >
                                                Çalışan seç
                                            </button>

                                            {eligibleEmployees.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    onClick={() => {
                                                        onSelectEmployee(String(employee.id));
                                                        setEmployeeDropdownOpen(false);
                                                    }}
                                                    className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-cyan-500/10"
                                                >
                                                <span className="block text-sm font-semibold text-white">
                                                    {employee.firstName} {employee.lastName}
                                                </span>
                                                    <span className="mt-1 block text-xs text-slate-400">
                                                    {employee.email}
                                                </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-0 rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                    2. Sistem e-postası
                                </label>

                                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                                    <FaEnvelope className="text-sm text-slate-500" />
                                    <span className={selectedEmployee?.email ? "text-white" : "text-slate-500"}>
                                    {selectedEmployee?.email ?? "Çalışan seçildiğinde otomatik doldurulur"}
                                </span>
                                </div>
                            </div>

                            {eligibleEmployees.length === 0 && (
                                <div className="flex items-center gap-4 rounded-[24px] border border-amber-400/35 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-200">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/10 text-amber-200">
                                    <FaInfo />
                                </span>
                                    Kullanıcı hesabı olmayan aktif çalışan bulunamadı.
                                </div>
                            )}

                            <div
                                className={`relative rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl ${
                                    dropdownOpen ? "z-30" : "z-0"
                                }`}
                            >
                                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                    3. Kullanıcı rolü
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-purple-400/35 hover:bg-white/[0.07]"
                                    >
                                    <span className="inline-flex items-center gap-3">
                                        <FaUserShield className="text-sm text-slate-400" />
                                        {createRoleNames[0]}
                                    </span>
                                        <FaChevronDown className="text-slate-400" />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute bottom-full left-0 z-[80] mb-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
                                            {["EMPLOYEE", "HR_MANAGER", "DEPARTMENT_MANAGER", "SYSTEM_ADMIN"].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => {
                                                        setCreateRoleNames([role]);
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-purple-500/10"
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 text-sm text-slate-400">
                                    Yetki verildikten sonra şifre belirleme linki çalışanın sistem e-postasına gönderilecektir.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-[0.34fr_0.66fr]">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                                >
                                    İptal
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreating || isConfirmOpen || !selectedEmployee}
                                    className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.22)] transition hover:shadow-[0_0_36px_rgba(34,211,238,0.36)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaPaperPlane className="text-sm" />
                                    {isCreating ? "Oluşturuluyor..." : "Kullanıcı Yetkisi Ver ve Mail Gönder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(6,11,23,0.98),rgba(2,6,23,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                        {confirmStage === "success" ? (
                            <div className="mb-5">
                                <h3 className="text-xl font-extrabold text-white">
                                    İşlem başarıyla tamamlandı.
                                </h3>
                            </div>
                        ) : (
                            <div className="mb-5">
                                <h3 className="text-xl font-extrabold text-white">Emin misiniz?</h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    {confirmKind?.type === "CREATE_USER"
                                        ? "Seçili çalışana kullanıcı yetkisi verilsin mi?"
                                        : confirmKind?.type === "UPDATE_ACTIVE"
                                            ? "Üyelik durumu güncellensin mi?"
                                            : "Yetkiler güncellensin mi?"}
                                </p>
                            </div>
                        )}

                        {confirmError && (
                            <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {confirmError}
                            </div>
                        )}

                        {confirmStage !== "success" ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={closeConfirm}
                                    disabled={confirmStage === "loading"}
                                    className="h-12 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-60"
                                >
                                    Hayır
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmYes}
                                    disabled={confirmStage === "loading" || !confirmKind}
                                    className="h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-sm font-bold text-white transition disabled:opacity-60"
                                >
                                    {confirmStage === "loading" ? "Onaylanıyor..." : "Evet"}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    closeConfirm();
                                    if (confirmKind?.type !== "CREATE_USER") {
                                        closeSettings();
                                    }
                                }}
                                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-sm font-bold text-white transition"
                            >
                                Tamam
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;
