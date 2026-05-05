import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
    FaCheck,
    FaCog,
    FaEnvelope,
    FaFilter,
    FaSearch,
    FaShieldAlt,
    FaTimes,
    FaUserCheck,
    FaUserPlus,
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
    | { type: "CREATE_USER"; email: string; employeeId?: number; roleNames: string[] }
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
    const [createEmail, setCreateEmail] = useState("");
    const [createRoleNames, setCreateRoleNames] = useState<string[]>(["EMPLOYEE"]);
    const [isCreating, setIsCreating] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
    const [useEmployeeLink, setUseEmployeeLink] = useState(false);
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

    const getDisplayName = (user: User) => {
        const u = user as UserWithOptionalName;
        if (u.fullName?.trim()) return u.fullName.trim();
        if (u.name?.trim()) return u.name.trim();

        const first = u.firstName?.trim() ?? "";
        const last = u.lastName?.trim() ?? "";
        const full = `${first} ${last}`.trim();
        return full || "İsim bilgisi yok";
    };

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
    }, [users, searchQuery, statusFilter, roleFilter]);

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
        setCreateEmail("");
        setCreateRoleNames(["EMPLOYEE"]);
        setSelectedEmployeeId("");
        setUseEmployeeLink(false);
        setIsCreating(false);
        setIsCreateOpen(true);
    };

    const closeCreateModal = () => setIsCreateOpen(false);

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
                    email: confirmKind.email,
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

        const email = createEmail.trim();
        if (!email || createRoleNames.length === 0) return;

        startConfirm({
            type: "CREATE_USER",
            email,
            roleNames: createRoleNames,
            employeeId: useEmployeeLink && selectedEmployeeId !== "" ? Number(selectedEmployeeId) : undefined,
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
            setCreateEmail("");
            return;
        }

        const employeeId = Number(employeeIdValue);
        setSelectedEmployeeId(employeeId);

        const employee = employees.find((e) => e.id === employeeId);

        if (employee) {
            setCreateEmail(employee.email);
        }
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
        "grid grid-cols-1 lg:grid-cols-[1.15fr_1.4fr_1fr_0.9fr_64px] gap-4 items-center";

    return (
        <div className="text-white">
            <div className="rounded-2xl p-6 mb-6 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/60">
                <div className="flex items-start justify-between gap-6 mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Bu sayfadan kullanıcı arayabilir, durum/yetki filtreleyebilir, üyelik
                            durumunu ve yetkileri düzenleyebilirsiniz.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-500 hover:to-blue-400 transition shadow-[0_12px_30px_rgba(37,99,235,0.28)]"
                    >
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <FaUserPlus className="text-[11px]" />
                    </span>
                        Yeni Kullanıcı
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => goToListWithFilter("ALL")}
                        className="rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-950/80 to-slate-950/90 px-4 py-3 text-left transition hover:border-blue-300/40 hover:shadow-[0_12px_30px_rgba(59,130,246,0.18)]"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xs text-blue-200/80 uppercase tracking-wide">
                                    Tüm Kullanıcılar
                                </div>
                                <div className="text-2xl font-semibold text-white mt-1">
                                    {counts.total}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Sistemde kayıtlı toplam kullanıcı
                                </div>
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shrink-0">
                                <FaUsers className="text-blue-300 text-lg" />
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => goToListWithFilter("ACTIVE")}
                        className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/70 to-slate-950/90 px-4 py-3 text-left transition hover:border-emerald-300/40 hover:shadow-[0_12px_30px_rgba(16,185,129,0.18)]"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xs text-emerald-200/80 uppercase tracking-wide">
                                    Aktif Kullanıcılar
                                </div>
                                <div className="text-2xl font-semibold text-white mt-1">
                                    {counts.active}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Sisteme erişimi açık kullanıcılar
                                </div>
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center shrink-0">
                                <FaUserCheck className="text-emerald-300 text-lg" />
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => goToListWithFilter("PASSIVE")}
                        className="rounded-xl border border-rose-400/20 bg-gradient-to-br from-rose-950/70 to-slate-950/90 px-4 py-3 text-left transition hover:border-rose-300/40 hover:shadow-[0_12px_30px_rgba(244,63,94,0.18)]"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xs text-rose-200/80 uppercase tracking-wide">
                                    Pasif Kullanıcılar
                                </div>
                                <div className="text-2xl font-semibold text-white mt-1">
                                    {counts.passive}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Sisteme erişimi kapalı kullanıcılar
                                </div>
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/20 flex items-center justify-center shrink-0">
                                <FaUserSlash className="text-rose-300 text-lg" />
                            </div>
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.6fr_0.6fr] gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="E-posta veya isim ile ara"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-slate-800/70 px-3 py-2.5 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/60 hover:border-sky-400/30 hover:bg-slate-800 transition"
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="pl-8 bg-slate-800/70 px-3 py-2.5 rounded text-sm outline-none border border-white/5 focus:border-sky-500/60 hover:border-sky-400/30 hover:bg-slate-800 transition w-full"
                        >
                            <option value="ALL">Tüm Durumlar</option>
                            <option value="ACTIVE">Sadece Aktif</option>
                            <option value="PASSIVE">Sadece Pasif</option>
                        </select>
                    </div>

                    <div className="relative">
                        <FaShieldAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-8 bg-slate-800/70 px-3 py-2.5 rounded text-sm outline-none border border-white/5 focus:border-sky-500/60 hover:border-sky-400/30 hover:bg-slate-800 transition w-full"
                        >
                            <option value="ALL">Tüm Yetkiler</option>
                            {roleFilterOptions.map((roleName) => (
                                <option key={roleName} value={roleName}>
                                    {roleName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div ref={listRef} className="bg-slate-900 rounded-2xl p-5 border border-white/10">
                <div className={`hidden lg:grid ${cardGrid} px-4 pb-3 border-b border-white/10`}>
                    <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                        <FaUsers className="text-sky-300 text-[12px]" />
                        Ad Soyad
                    </div>

                    <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                        <FaEnvelope className="text-sky-300 text-[12px]" />
                        E-posta
                    </div>

                    <div className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-200">
                        <FaCheck className="text-emerald-300 text-[12px]" />
                        Üyelik Durumu
                    </div>

                    <div className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-200">
                        <FaShieldAlt className="text-blue-300 text-[12px]" />
                        Yetkiler
                    </div>

                    <div className="justify-self-center text-[13px] font-semibold text-slate-200">
                        İşlem
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="py-8 text-slate-400 text-sm">Filtreye uygun kullanıcı bulunamadı.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 mt-3">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.email}
                                className="rounded-xl border border-white/10 bg-slate-950/40 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)] hover:border-sky-400/20 hover:bg-slate-900/60 hover:shadow-[0_12px_28px_rgba(14,165,233,0.08)] transition"
                            >
                                <div className={cardGrid}>
                                    <div className="text-sm text-slate-200 px-2">
                                        {getDisplayName(user) === "İsim bilgisi yok" ? (
                                            <span className="text-slate-500 italic">İsim bilgisi yok</span>
                                        ) : (
                                            <span className="text-white/95">{getDisplayName(user)}</span>
                                        )}
                                    </div>

                                    <div className="inline-flex items-center gap-2 text-sm text-white/90 min-w-0 px-2">
                                        <FaEnvelope className="text-slate-400 text-[11px] shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>

                                    <div className="flex justify-center">
                                        {user.active ? (
                                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs">
                <FaUserCheck className="text-[10px]" />
                Üyelik Açık
            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/30 text-xs">
                <FaUserSlash className="text-[10px]" />
                Üyelik Kapalı
            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        {user.roles?.length ? (
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {user.roles.map((r) => (
                                                    <span
                                                        key={r.name}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/20"
                                                    >
                        {r.name}
                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">Yetki yok</span>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => openSettings(user.email)}
                                            className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-sky-400/30 transition"
                                            aria-label="Ayarlar"
                                        >
                                            <FaCog className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SETTINGS MODAL */}
            {settingsOpenForEmail && currentUser && (
                <div
                    className="fixed inset-0 bg-black/65 flex items-center justify-center z-[55] p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeSettings();
                    }}
                >
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl shadow-[0_30px_90px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
                            <div>
                                <div className="text-sm text-slate-400">Kullanıcı Düzenle</div>
                                <div className="text-lg font-semibold mt-0.5">{currentUser.email}</div>
                            </div>

                            <button
                                type="button"
                                onClick={closeSettings}
                                className="p-2 rounded hover:bg-white/5 text-slate-300 hover:text-white transition"
                                aria-label="Kapat"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-5 overflow-auto staffly-scroll max-h-[calc(90vh-84px)]">
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("MEMBERSHIP")}
                                    className={`flex-1 px-3 py-2 rounded text-sm transition border inline-flex items-center justify-center gap-2 ${
                                        settingsTab === "MEMBERSHIP"
                                            ? "bg-sky-500/20 border-sky-500/40 text-white"
                                            : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    <FaUserCheck className="text-xs" />
                                    Üyelik Aç / Kapat
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("PERMISSIONS")}
                                    className={`flex-1 px-3 py-2 rounded text-sm transition border inline-flex items-center justify-center gap-2 ${
                                        settingsTab === "PERMISSIONS"
                                            ? "bg-sky-500/20 border-sky-500/40 text-white"
                                            : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    <FaShieldAlt className="text-xs" />
                                    Yetki Değiştir
                                </button>
                            </div>

                            {settingsTab === "MEMBERSHIP" && (
                                <div className="bg-white/0 border border-white/10 rounded-xl p-4">
                                    <div className="text-sm text-slate-300 mb-3">
                                        Kullanıcının giriş üyeliğini açıp kapatabilirsiniz.
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDraft(true)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition inline-flex items-center justify-center gap-2 ${
                                                activeDraft
                                                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                                                    : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                            }`}
                                        >
                                            <FaUserCheck className="text-xs" />
                                            Üyelik Açık
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setActiveDraft(false)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition inline-flex items-center justify-center gap-2 ${
                                                !activeDraft
                                                    ? "bg-rose-500/20 border-rose-400/50 text-rose-200"
                                                    : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                            }`}
                                        >
                                            <FaUserSlash className="text-xs" />
                                            Üyelik Kapalı
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={updateActiveDraft}
                                        disabled={!activeHasChanged || isConfirmOpen}
                                        className="mt-3 bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition w-full shadow-[0_10px_24px_rgba(37,99,235,0.25)] disabled:opacity-60"
                                    >
                                        Üyelik Durumunu Kaydet
                                    </button>

                                    {!activeHasChanged && (
                                        <div className="text-[11px] text-slate-400 mt-2">Değişiklik yok.</div>
                                    )}
                                </div>
                            )}

                            {settingsTab === "PERMISSIONS" && (
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                    <div className="xl:col-span-1 bg-white/0 border border-white/10 rounded-xl p-4 h-fit">
                                        <div className="text-sm font-medium text-slate-200 mb-2">Seçili Yetkiler</div>
                                        {roleDraft.length === 0 ? (
                                            <div className="text-xs text-slate-400">Henüz yetki seçilmedi.</div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {roleDraft.map((rn) => (
                                                    <button
                                                        key={rn}
                                                        type="button"
                                                        onClick={() => toggleRole(rn)}
                                                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-100 text-xs hover:bg-sky-500/20 transition"
                                                        aria-label={`${rn} yetkisini kaldır`}
                                                    >
                                                        <FaShieldAlt className="text-[10px]" />
                                                        {rn}
                                                        <span className="text-sky-200/90">
                                                            <FaTimes />
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={updateRolesDraft}
                                            disabled={!rolesHasChanged || isConfirmOpen}
                                            className="mt-4 bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition w-full shadow-[0_10px_24px_rgba(37,99,235,0.25)] disabled:opacity-60"
                                        >
                                            Yetkileri Kaydet
                                        </button>

                                        {!rolesHasChanged && (
                                            <div className="text-[11px] text-slate-400 mt-2">Değişiklik yok.</div>
                                        )}
                                    </div>

                                    <div className="xl:col-span-2 bg-white/0 border border-white/10 rounded-xl p-4">
                                        <div className="text-sm font-medium text-slate-200 mb-2">Yetkiler (Ara + Seç)</div>

                                        <div className="relative mb-3">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-300 text-[11px]" />
                                            <input
                                                type="text"
                                                placeholder="Yetki ara..."
                                                value={roleSearch}
                                                onChange={(e) => setRoleSearch(e.target.value)}
                                                className="pl-8 bg-slate-800 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/60 hover:border-sky-400/30 hover:bg-slate-800 transition"
                                            />
                                        </div>

                                        {areRolesLoading ? (
                                            <div className="text-xs text-slate-400">Yetkiler yükleniyor...</div>
                                        ) : filteredRoles.length === 0 ? (
                                            <div className="text-xs text-slate-400">Uygun yetki bulunamadı.</div>
                                        ) : (
                                            <div className="max-h-[360px] overflow-auto pr-1 grid grid-cols-1 gap-2 staffly-scroll">
                                                {filteredRoles.map((role) => {
                                                    const selected = roleDraft.includes(role.name);
                                                    return (
                                                        <button
                                                            key={role.name}
                                                            type="button"
                                                            onClick={() => toggleRole(role.name)}
                                                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm transition ${
                                                                selected
                                                                    ? "bg-sky-500/20 border-sky-500/40 text-white"
                                                                    : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                                        selected ? "bg-sky-300" : "bg-slate-600"
                                                                    }`}
                                                                />
                                                                <div className="text-left">
                                                                    <div className="font-medium">{role.name}</div>
                                                                    {role.description ? (
                                                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                                                            {role.description}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            {selected ? (
                                                                <span className="text-sky-200">
                                                                    <FaCheck />
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-500"> </span>
                                                            )}
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold inline-flex items-center gap-2">
                                <FaUserPlus />
                                Yeni Kullanıcı Oluştur
                            </h3>

                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="text-slate-300 hover:text-white transition text-sm p-2 rounded hover:bg-white/5"
                            >
                                Kapat
                            </button>
                        </div>

                        <form onSubmit={onSubmitCreate} className="space-y-3">
                            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                                <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useEmployeeLink}
                                        onChange={(e) => {
                                            setUseEmployeeLink(e.target.checked);
                                            setSelectedEmployeeId("");
                                            setCreateEmail("");
                                        }}
                                        className="accent-blue-500"
                                    />
                                    Mevcut çalışana kullanıcı hesabı bağla
                                </label>

                                {useEmployeeLink && (
                                    <div className="relative mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                                            className="w-full rounded bg-slate-800 px-3 py-2 text-left text-sm text-white border border-white/5 hover:border-sky-400/30"
                                        >
                                            {selectedEmployeeId
                                                ? (() => {
                                                    const employee = employees.find((e) => e.id === selectedEmployeeId);
                                                    return employee
                                                        ? `${employee.firstName} ${employee.lastName} - ${employee.email}`
                                                        : "Çalışan seç";
                                                })()
                                                : "Çalışan seç"}
                                        </button>

                                        {employeeDropdownOpen && (
                                            <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded border border-white/10 bg-slate-900 shadow-lg staffly-scroll">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onSelectEmployee("");
                                                        setEmployeeDropdownOpen(false);
                                                    }}
                                                    className="block w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-sky-500/20 hover:text-white"
                                                >
                                                    Çalışan seç
                                                </button>

                                                {employees.map((employee) => (
                                                    <button
                                                        key={employee.id}
                                                        type="button"
                                                        onClick={() => {
                                                            onSelectEmployee(String(employee.id));
                                                            setEmployeeDropdownOpen(false);
                                                        }}
                                                        className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-sky-500/20"
                                                    >
                                                        {employee.firstName} {employee.lastName} - {employee.email}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                    type="email"
                                    placeholder="E-posta"
                                    value={createEmail}
                                    onChange={(e) => setCreateEmail(e.target.value)}
                                    disabled={useEmployeeLink && selectedEmployeeId !== ""}
                                    className="pl-8 bg-slate-800 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/60 hover:border-sky-400/30 hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                                <div className="text-sm text-slate-200 mb-2">Kullanıcı Rolü</div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-full bg-slate-800 text-white px-3 py-2 rounded text-sm border border-white/5 text-left"
                                    >
                                        {createRoleNames[0]}
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute mt-1 w-full bg-slate-900 border border-white/10 rounded shadow-lg z-50">
                                            {["EMPLOYEE", "HR_MANAGER", "DEPARTMENT_MANAGER", "SYSTEM_ADMIN"].map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => {
                                                        setCreateRoleNames([role]);
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="px-3 py-2 text-sm text-white hover:bg-sky-500/20 cursor-pointer"
                                                >
                                                    {role}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Kullanıcı oluşturulduktan sonra şifre belirleme linki e-posta adresine gönderilecektir.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating || isConfirmOpen}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-500 transition w-full disabled:opacity-60 shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                            >
                                <FaUserPlus className="text-xs" />
                                {isCreating ? "Oluşturuluyor..." : "Kullanıcı Oluştur ve Mail Gönder"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
                        {confirmStage === "success" ? (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">İşlem başarıyla tamamlandı.</h3>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Emin misiniz?</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {confirmKind?.type === "CREATE_USER"
                                        ? "Bu kullanıcı oluşturulsun mu?"
                                        : confirmKind?.type === "UPDATE_ACTIVE"
                                            ? "Üyelik durumu güncellensin mi?"
                                            : "Yetkiler güncellensin mi?"}
                                </p>
                            </div>
                        )}

                        {confirmError && <div className="text-red-400 text-sm mb-3">{confirmError}</div>}

                        {confirmStage !== "success" ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeConfirm}
                                    disabled={confirmStage === "loading"}
                                    className="flex-1 bg-white/0 border border-white/10 px-3 py-2 rounded text-sm hover:bg-white/5 transition disabled:opacity-60"
                                >
                                    Hayır
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmYes}
                                    disabled={confirmStage === "loading" || !confirmKind}
                                    className="flex-1 bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition disabled:opacity-60 shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                                >
                                    {confirmStage === "loading" ? "Onaylanıyor..." : "Evet"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeConfirm();
                                        if (confirmKind?.type !== "CREATE_USER") {
                                            closeSettings();
                                        }
                                    }}
                                    className="w-full bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                                >
                                    Tamam
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;

