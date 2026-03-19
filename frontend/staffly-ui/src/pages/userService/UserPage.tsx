import { FormEvent, useEffect, useMemo, useState } from "react";
import { FaCog, FaCheck, FaTimes } from "react-icons/fa";
import {
    createUser,
    getRoles,
    getUsers,
    setUserActive,
    setUserRoles,
} from "../../services/userService";
import type { Role, User } from "../../services/userService";

type StatusFilter = "ALL" | "ACTIVE" | "PASSIVE";
type SettingsTab = "ACTIVE" | "ROLES";

type ConfirmKind =
    | { type: "CREATE_USER"; email: string; password: string }
    | { type: "UPDATE_ACTIVE"; email: string; active: boolean }
    | { type: "UPDATE_ROLES"; email: string; roles: string[] }
    | null;

const UserPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [searchEmail, setSearchEmail] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const [settingsOpenForEmail, setSettingsOpenForEmail] = useState<
        string | null
    >(null);
    const [settingsTab, setSettingsTab] = useState<SettingsTab>("ACTIVE");

    const [activeDraft, setActiveDraft] = useState<boolean>(true);
    const [roleDraft, setRoleDraft] = useState<string[]>([]);
    const [roleSearch, setRoleSearch] = useState("");

    const [areRolesLoading, setAreRolesLoading] = useState(false);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
    const [confirmStage, setConfirmStage] = useState<
        "form" | "loading" | "success"
    >("form");
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const currentUser = useMemo(() => {
        if (!settingsOpenForEmail) return null;
        return users.find((u) => u.email === settingsOpenForEmail) ?? null;
    }, [settingsOpenForEmail, users]);

    const filteredUsers = useMemo(() => {
        const q = searchEmail.trim().toLowerCase();
        return users.filter((u) => {
            const matchesEmail =
                q.length === 0 || u.email.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && u.active) ||
                (statusFilter === "PASSIVE" && !u.active);

            return matchesEmail && matchesStatus;
        });
    }, [users, searchEmail, statusFilter]);

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

    useEffect(() => {
        fetchUsers().catch((error) =>
            console.error("Kullanıcıları alma hatası:", error)
        );
    }, []);

    // Modal açılınca draftları doldur + roller listesi gerekiyorsa çek
    useEffect(() => {
        if (!settingsOpenForEmail) return;

        const u = users.find((x) => x.email === settingsOpenForEmail);
        setActiveDraft(!!u?.active);
        setRoleDraft(u?.roles?.map((r) => r.name) ?? []);
        setRoleSearch("");

        if (roles.length === 0) {
            fetchAllRoles().catch((error) =>
                console.error("Rolleri alma hatası:", error)
            );
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

    const openCreateModal = () => {
        setCreateEmail("");
        setCreatePassword("");
        setIsCreating(false);
        setIsCreateOpen(true);
    };

    const closeCreateModal = () => setIsCreateOpen(false);

    const openSettings = (email: string) => {
        setSettingsOpenForEmail(email);
        setSettingsTab("ACTIVE");
    };

    const closeSettings = () => {
        setSettingsOpenForEmail(null);
        setSettingsTab("ACTIVE");
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
                    email: confirmKind.email,
                    password: confirmKind.password,
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
        const password = createPassword;

        if (!email || !password) return;

        startConfirm({
            type: "CREATE_USER",
            email,
            password,
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

    return (
        <div className="text-white">
            <div className="rounded-2xl p-6 mb-6 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/60">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">Kullanıcı Yönetimi</h2>
                        <p className="text-slate-400 text-sm">
                            E-posta ile arayın, durum ve roller için ayarlardan güncelleyin.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-500 transition shadow-[0_10px_30px_rgba(37,99,235,0.25)]"
                    >
                        Yeni Kullanıcı
                    </button>
                </div>

                <div className="flex gap-3 mt-5">
                    <input
                        type="email"
                        placeholder="E-postaya göre ara"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="bg-slate-800/70 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/50"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="bg-slate-800/70 px-3 py-2 rounded text-sm outline-none border border-white/5 focus:border-sky-500/50"
                    >
                        <option value="ALL">Tümü</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="PASSIVE">Pasif</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 border border-white/10">
                <table className="w-full text-sm">
                    <thead className="text-slate-400 text-left">
                    <tr>
                        <th className="py-1">E-posta</th>
                        <th className="py-1 w-28">DURUM</th>
                        <th className="py-1">Roller</th>
                        <th className="py-1 w-10"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td className="py-6 text-slate-400" colSpan={4}>
                                Kullanıcı bulunamadı
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <tr
                                key={user.email}
                                className="border-t border-slate-800/70"
                            >
                                <td className="py-3">
                                    <span className="text-white/90">{user.email}</span>
                                </td>

                                <td className="py-3">
                                    {user.active ? (
                                        <span className="inline-flex items-center gap-2 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        Aktif
                      </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Pasif
                      </span>
                                    )}
                                </td>

                                <td className="py-3 text-white/90">
                                    {user.roles?.map((r) => r.name).join(", ")}
                                </td>

                                <td className="py-3">
                                    <button
                                        type="button"
                                        onClick={() => openSettings(user.email)}
                                        className="p-2 rounded hover:bg-white/5 text-slate-300 hover:text-white transition"
                                        aria-label="Ayarlar"
                                    >
                                        <FaCog />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* SETTINGS MODAL (pop-up) */}
            {settingsOpenForEmail && currentUser && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[55] p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeSettings();
                    }}
                >
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
                        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
                            <div>
                                <div className="text-sm text-slate-400">Ayarlar</div>
                                <div className="text-lg font-semibold">{currentUser.email}</div>
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

                        <div className="p-5">
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("ACTIVE")}
                                    className={`flex-1 px-3 py-2 rounded text-sm transition border ${
                                        settingsTab === "ACTIVE"
                                            ? "bg-sky-500/20 border-sky-500/40 text-white"
                                            : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    Durum
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSettingsTab("ROLES")}
                                    className={`flex-1 px-3 py-2 rounded text-sm transition border ${
                                        settingsTab === "ROLES"
                                            ? "bg-sky-500/20 border-sky-500/40 text-white"
                                            : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    Roller
                                </button>
                            </div>

                            {settingsTab === "ACTIVE" && (
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-white/0 border border-white/10 rounded-xl p-4">
                                        <div className="text-sm text-slate-400 mb-2">
                                            Aktif / Pasif
                                        </div>

                                        <select
                                            value={activeDraft ? "ACTIVE" : "PASSIVE"}
                                            onChange={(e) => setActiveDraft(e.target.value === "ACTIVE")}
                                            className="w-full bg-slate-800 px-3 py-2 rounded text-sm outline-none border border-white/5 focus:border-sky-500/50"
                                        >
                                            <option value="ACTIVE">Aktif</option>
                                            <option value="PASSIVE">Pasif</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={updateActiveDraft}
                                            disabled={!activeHasChanged || isConfirmOpen}
                                            className="mt-3 bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition w-full shadow-[0_10px_24px_rgba(37,99,235,0.25)] disabled:opacity-60"
                                        >
                                            Aktif / Pasif Kaydet
                                        </button>

                                        {!activeHasChanged && (
                                            <div className="text-[11px] text-slate-400 mt-2">
                                                Değişiklik yok.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {settingsTab === "ROLES" && (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white/0 border border-white/10 rounded-xl p-4">
                                        <div className="text-sm font-medium text-slate-200 mb-2">
                                            Seçili Roller
                                        </div>

                                        {roleDraft.length === 0 ? (
                                            <div className="text-xs text-slate-400">
                                                Henüz rol seçilmedi.
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {roleDraft.map((rn) => (
                                                    <button
                                                        key={rn}
                                                        type="button"
                                                        onClick={() => toggleRole(rn)}
                                                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-100 text-xs hover:bg-sky-500/20 transition"
                                                        aria-label={`${rn} rolünü kaldır`}
                                                    >
                                                        {rn}
                                                        <span className="text-sky-200/90">
                              <FaTimes />
                            </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white/0 border border-white/10 rounded-xl p-4">
                                        <div className="text-sm font-medium text-slate-200 mb-2">
                                            Roller (Ara + Seç)
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Rol ara..."
                                            value={roleSearch}
                                            onChange={(e) => setRoleSearch(e.target.value)}
                                            className="bg-slate-800 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/50 mb-3"
                                        />

                                        {areRolesLoading ? (
                                            <div className="text-xs text-slate-400">
                                                Roller yükleniyor...
                                            </div>
                                        ) : filteredRoles.length === 0 ? (
                                            <div className="text-xs text-slate-400">
                                                Uygun rol bulunamadı.
                                            </div>
                                        ) : (
                                            <div className="max-h-64 overflow-auto pr-1 grid grid-cols-1 gap-2">
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

                                        <button
                                            type="button"
                                            onClick={updateRolesDraft}
                                            disabled={!rolesHasChanged || isConfirmOpen}
                                            className="mt-4 bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-500 transition w-full shadow-[0_10px_24px_rgba(37,99,235,0.25)] disabled:opacity-60"
                                        >
                                            Rolleri Kaydet
                                        </button>

                                        {!rolesHasChanged && (
                                            <div className="text-[11px] text-slate-400 mt-2">
                                                Değişiklik yok.
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
                            <h3 className="text-lg font-semibold">Yeni Kullanıcı Oluştur</h3>

                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="text-slate-300 hover:text-white transition text-sm p-2 rounded hover:bg-white/5"
                            >
                                Kapat
                            </button>
                        </div>

                        <form onSubmit={onSubmitCreate} className="space-y-3">
                            <input
                                type="email"
                                placeholder="E-posta"
                                value={createEmail}
                                onChange={(e) => setCreateEmail(e.target.value)}
                                className="bg-slate-800 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/50"
                            />

                            <input
                                type="password"
                                placeholder="Şifre"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                className="bg-slate-800 px-3 py-2 rounded text-sm outline-none w-full border border-white/5 focus:border-sky-500/50"
                            />

                            <button
                                type="submit"
                                disabled={isCreating || isConfirmOpen}
                                className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-500 transition w-full disabled:opacity-60 shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                            >
                                {isCreating ? "Oluşturuluyor..." : "Oluştur"}
                            </button>

                            <div className="text-xs text-slate-400">
                                Oluşturma işlemi için onay isteği açılacaktır.
                            </div>
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
                                <h3 className="text-lg font-semibold">
                                    İşlem başarıyla tamamlandı.
                                </h3>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Emin misiniz?</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {confirmKind?.type === "CREATE_USER"
                                        ? "Bu kullanıcı oluşturulsun mu?"
                                        : confirmKind?.type === "UPDATE_ACTIVE"
                                            ? "Aktif/pasif durumu güncellensin mi?"
                                            : "Roller güncellensin mi?"}
                                </p>
                            </div>
                        )}

                        {confirmError && (
                            <div className="text-red-400 text-sm mb-3">
                                {confirmError}
                            </div>
                        )}

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
                                        // Güncelleme modalından gelmişse ayarlar kapanır
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