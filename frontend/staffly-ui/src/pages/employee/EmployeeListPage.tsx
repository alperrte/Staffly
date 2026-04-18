import { Fragment, useEffect, useMemo, useState } from "react";
import { getAllEmployees, updateEmployee } from "../../services/employeeService";
import { useLocation, useNavigate } from "react-router-dom";
import { POSITION_OPTIONS_TR } from "../../constants/positions";

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;

    positionName?: string | null;
    departmentName?: string | null;

    hireDate?: string | null;
    gender?: string | null;

    [key: string]: unknown;
};

const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400 border border-green-500/30",
    INACTIVE: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const statusLabelTR: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
};
//Push

const genderLabelTR: Record<string, string> = {
    MALE: "Erkek",
    FEMALE: "Kadın",
    male: "Erkek",
    female: "Kadın",
    // API bazen TR/baş harfli döndürebilir
    Erkek: "Erkek",
    Kadın: "Kadın",
};

const formatGenderTR = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const raw = String(value).trim();
    if (!raw) return "-";

    const upper = raw.toUpperCase();
    if (genderLabelTR[upper]) return genderLabelTR[upper];
    if (genderLabelTR[raw]) return genderLabelTR[raw];
    if (genderLabelTR[raw.toLowerCase()]) return genderLabelTR[raw.toLowerCase()];

    return raw;
};

const emptyDash = (v: unknown) => {
    if (v === null || v === undefined) return "-";
    const s = String(v).trim();
    return s.length ? s : "-";
};

const formatMaybeDateTR = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const s = String(value).trim();
    if (!s) return "-";

    // ISO/date-like string denemesi; formatlanamazsa olduğu gibi bırakıyoruz
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;

    return d.toLocaleDateString("tr-TR");
};

const toHumanLabel = (key: string) => {
    // camelCase / snake_case -> okunur
    const withSpaces =
        key
            .replace(/_/g, " ")
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .toLowerCase()
            .trim();

    return withSpaces
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filtered, setFiltered] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        positionName: "",
        status: "ACTIVE",
        gender: "",
    });

    useEffect(() => {
        let isMounted = true;

        const fetchEmployees = async () => {
            try {
                const data = await getAllEmployees();

                // ⚠️ Backend response yapısına göre gerekirse değiştir
                const list: Employee[] = data;

                if (isMounted) {
                    setEmployees(list);
                    setFiltered(list);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError("Çalışanlar alınamadı");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchEmployees();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const state = location.state as
            | { employeeCreated?: boolean; createdEmployeeName?: string }
            | null;

        if (state?.employeeCreated) {
            const name = state.createdEmployeeName?.trim();
            setSuccessMessage(
                name
                    ? `${name} başarıyla oluşturuldu.`
                    : "Çalışan başarıyla oluşturuldu."
            );

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const q = search.toLowerCase().trim();

            if (!q) {
                setFiltered(employees);
                return;
            }

            const result = employees.filter((emp) => {
                const haystack = Object.values(emp)
                    .map((v) => (v === null || v === undefined ? "" : String(v)))
                    .join(" ")
                    .toLowerCase();

                return haystack.includes(q);
            });

            setFiltered(result);
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, employees]);

    const labelTR: Record<string, string> = useMemo(
        () => ({
            hireDate: "İşe Giriş Tarihi",
            gender: "Cinsiyet",
            phoneNumber: "Telefon",
            address: "Adres",
            city: "Şehir",
            country: "Ülke",
            zipCode: "Posta Kodu",
            positionName: "Pozisyon",
            departmentName: "Departman",
            status: "Durum",
            createdAt: "Oluşturma Tarihi",
            updatedAt: "Güncelleme Tarihi",
        }),
        []
    );

    // Üstte/tabloda zaten gösterdiğimiz alanlar extra listede tekrar çıkmasın
    const excludedFromExtra = useMemo(
        () =>
            new Set<string>([
                "id",
                "firstName",
                "lastName",
                "email",
                "status",
                "positionName",
                "departmentName",

                // tekrar olmasın diye ekledik
                "hireDate",
                "gender",
            ]),
        []
    );

    const statusOptions = useMemo(() => ["ACTIVE", "INACTIVE"], []);

    const positionOptions = useMemo(() => [...POSITION_OPTIONS_TR], []);

    const genderOptions = useMemo(() => ["", "MALE", "FEMALE"], []);

    const startEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setEditForm({
            firstName: String(emp.firstName ?? ""),
            lastName: String(emp.lastName ?? ""),
            email: String(emp.email ?? ""),
            positionName: String(emp.positionName ?? ""),
            status: String(emp.status ?? "ACTIVE"),
            gender: String(emp.gender ?? ""),
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setSavingId(null);
    };

    const saveEdit = async (empId: number) => {
        try {
            setSavingId(empId);
            setError("");

            const payload = {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                email: editForm.email.trim(),
                positionName: editForm.positionName.trim(),
                status: editForm.status,
                gender: editForm.gender || null,
            };

            const updated = await updateEmployee(empId, payload);

            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === empId
                        ? {
                              ...emp,
                              ...payload,
                              ...(updated && typeof updated === "object" ? updated : {}),
                          }
                        : emp
                )
            );

            setSuccessMessage("Çalışan bilgileri güncellendi.");
            setEditingId(null);
        } catch (err) {
            console.error(err);
            setError("Çalışan güncellenemedi");
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return <div className="text-slate-400">Çalışanlar yükleniyor...</div>;
    }

    return (
        <div className="w-full flex flex-col gap-6 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-semibold">Çalışanlar</h1>

                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => navigate("/app/employees/create")}
                        className="bg-sky-500 hover:bg-sky-400 px-5 py-2 rounded-lg text-sm font-semibold text-white transition"
                    >
                        + Çalışan Ekle
                    </button>

                    <input
                        type="text"
                        placeholder="Ara..."
                        className="w-[260px] max-w-full rounded-lg bg-slate-900/50 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            {successMessage && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {successMessage}
                </div>
            )}

            <div className="rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1240px]">
                        <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                            <th className="p-3 text-left">Ad Soyad</th>
                            <th className="p-3 text-left">E-posta</th>
                            <th className="p-3 text-left">Pozisyon</th>
                            <th className="p-3 text-left">Departman</th>
                            <th className="p-3 text-left">İşe Giriş Tarihi</th>
                            <th className="p-3 text-left">Cinsiyet</th>
                            <th className="p-3 text-left">Durum</th>
                            <th className="p-3 text-right">İşlemler</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.map((emp) => {
                            const isOpen = expandedId === emp.id;

                            const extraEntries = Object.entries(emp).filter(([k, v]) => {
                                if (excludedFromExtra.has(k)) return false;
                                if (v === undefined) return false;
                                return true;
                            });

                            const hireDateVal = emp.hireDate ?? null;
                            const genderVal = emp.gender ?? null;

                            return (
                                <Fragment key={emp.id}>
                                    <tr
                                        onClick={() => setExpandedId((prev) => (prev === emp.id ? null : emp.id))}
                                        className="cursor-pointer border-t border-slate-700 hover:bg-slate-800/35 transition"
                                    >
                                        <td className="p-3 font-medium text-slate-200">
                                            {emp.firstName} {emp.lastName}
                                            <span className="ml-2 inline-flex align-middle text-slate-400">
                          {isOpen ? "▾" : "▸"}
                        </span>
                                        </td>

                                        <td className="p-3 text-slate-200/90">{emp.email}</td>

                                        <td className="p-3 text-slate-200/90">{emptyDash(emp.positionName)}</td>

                                        <td className="p-3 text-slate-200/90">{emptyDash(emp.departmentName)}</td>

                                        <td className="p-3 text-slate-200/90">
                                            {hireDateVal ? formatMaybeDateTR(hireDateVal) : "-"}
                                        </td>

                                        <td className="p-3 text-slate-200/90">{formatGenderTR(genderVal)}</td>

                                        <td className="p-3">
                        <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                                statusStyles[emp.status] || ""
                            }`}
                        >
                          {statusLabelTR[emp.status] ?? emp.status}
                        </span>
                                        </td>

                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (editingId === emp.id) {
                                                        cancelEdit();
                                                        return;
                                                    }
                                                    startEdit(emp);
                                                }}
                                                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/60 p-2 text-slate-200 hover:border-sky-400 hover:text-sky-300 transition"
                                                aria-label="Çalışanı güncelle"
                                                title="Çalışanı güncelle"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14.7 6.3a4 4 0 0 0 2.44 2.44l.37.12a1 1 0 0 1 .57 1.44l-1.04 1.8a6 6 0 0 1-5.2 3h-2.1a2 2 0 0 0-1.74 1l-.7 1.2a1 1 0 0 1-1.45.34l-1.36-.92a1 1 0 0 1-.22-1.47l1.03-1.31a2 2 0 0 0-.18-2.68l-.81-.8a1 1 0 0 1-.02-1.42l1.44-1.47a1 1 0 0 1 1.4-.02l.88.87a2 2 0 0 0 2.77.11l1.18-.96a1 1 0 0 1 1.45.3l.14.23Z"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>

                                    {editingId === emp.id && (
                                        <tr>
                                            <td colSpan={8} className="p-4 bg-slate-900/50 border-t border-slate-700">
                                                <div className="rounded-xl border border-slate-700 bg-slate-950/30 p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-sm font-semibold text-slate-100">
                                                            Çalışan Güncelle
                                                        </h3>
                                                        <span className="text-xs text-slate-400">
                                                            Açılır düzenleme formu
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        <input
                                                            type="text"
                                                            value={editForm.firstName}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    firstName: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Ad"
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400/70"
                                                        />

                                                        <input
                                                            type="text"
                                                            value={editForm.lastName}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    lastName: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Soyad"
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400/70"
                                                        />

                                                        <input
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="E-posta"
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400/70"
                                                        />

                                                        <select
                                                            value={editForm.positionName}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    positionName: e.target.value,
                                                                }))
                                                            }
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400/70"
                                                        >
                                                            <option value="">Pozisyon seç</option>
                                                            {positionOptions.map((position) => (
                                                                <option key={position} value={position}>
                                                                    {position}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            value={editForm.status}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    status: e.target.value,
                                                                }))
                                                            }
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400/70"
                                                        >
                                                            {statusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {statusLabelTR[status] ?? status}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            value={editForm.gender}
                                                            onChange={(e) =>
                                                                setEditForm((prev) => ({
                                                                    ...prev,
                                                                    gender: e.target.value,
                                                                }))
                                                            }
                                                            className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400/70"
                                                        >
                                                            <option value="">Cinsiyet seç</option>
                                                            {genderOptions
                                                                .filter((g) => g)
                                                                .map((gender) => (
                                                                    <option key={gender} value={gender}>
                                                                        {formatGenderTR(gender)}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-200 hover:border-slate-500 hover:text-white transition"
                                                        >
                                                            Vazgeç
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={savingId === emp.id}
                                                            onClick={() => saveEdit(emp.id)}
                                                            className="px-4 py-2 text-sm rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-medium transition"
                                                        >
                                                            {savingId === emp.id ? "Kaydediliyor..." : "Kaydet"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {isOpen && (
                                        <tr>
                                            <td colSpan={8} className="p-4 bg-slate-900/35">
                                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                                                    {/* Sabit kartlar */}
                                                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3">
                                                        <div className="text-xs text-slate-400">Pozisyon</div>
                                                        <div className="text-sm text-slate-200 font-medium mt-1">
                                                            {emptyDash(emp.positionName)}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3">
                                                        <div className="text-xs text-slate-400">Departman</div>
                                                        <div className="text-sm text-slate-200 font-medium mt-1">
                                                            {emptyDash(emp.departmentName)}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3">
                                                        <div className="text-xs text-slate-400">İşe Giriş Tarihi</div>
                                                        <div className="text-sm text-slate-200 font-medium mt-1">
                                                            {hireDateVal ? formatMaybeDateTR(hireDateVal) : "-"}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3">
                                                        <div className="text-xs text-slate-400">Cinsiyet</div>
                                                        <div className="text-sm text-slate-200 font-medium mt-1">
                                                            {formatGenderTR(genderVal)}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3 lg:col-span-1">
                                                        <div className="text-xs text-slate-400">Durum</div>
                                                        <div className="text-sm text-slate-200 font-medium mt-1">
                                                            {statusLabelTR[emp.status] ?? emp.status}
                                                        </div>
                                                    </div>

                                                    {/* Extra alanlar (gender/hireDate tekrar gelmesin diye excluded) */}
                                                    {extraEntries.map(([key, value]) => {
                                                        const label = labelTR[key] ?? toHumanLabel(key);

                                                        const keyLower = key.toLowerCase();
                                                        const isDateKey =
                                                            keyLower.includes("date") || keyLower.includes("hire");

                                                        const displayValue = isDateKey
                                                            ? formatMaybeDateTR(value)
                                                            : Array.isArray(value)
                                                                ? value.join(", ")
                                                                : typeof value === "boolean"
                                                                    ? value
                                                                        ? "Evet"
                                                                        : "Hayır"
                                                                    : emptyDash(value);

                                                        return (
                                                            <div
                                                                key={key}
                                                                className="rounded-xl border border-slate-700/80 bg-slate-950/20 p-3"
                                                            >
                                                                <div className="text-xs text-slate-400">{label}</div>
                                                                <div className="text-sm text-slate-200 font-medium mt-1 break-words">
                                                                    {displayValue}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="p-6 text-center text-slate-400">Sonuç bulunamadı</div>
                )}
            </div>
        </div>
    );
};

export default EmployeeListPage;