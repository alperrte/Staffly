import { Fragment, useEffect, useMemo, useState } from "react";
import { getAllEmployees, updateEmployee } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";
import { useLocation, useNavigate } from "react-router-dom";

/* ══ Types ══════════════════════════════════════════════════════════════ */
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

type DepartmentPositionResponse = { id: number; name: string; description?: string };
type SubDepartmentResponse = {
    id: number; name: string; description?: string;
    positions?: DepartmentPositionResponse[];
};
type DepartmentResponse = {
    id: number; name: string; description?: string;
    subDepartments?: SubDepartmentResponse[];
};

type SortDir = "asc" | "desc";
type SortKey = keyof Employee | null;
type DropdownOption = { value: string; label: string };

/* ══ Helpers ════════════════════════════════════════════════════════════ */
const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400 border border-green-500/30",
    INACTIVE: "bg-red-500/20 text-red-400 border border-red-500/30",
};
const statusLabelTR: Record<string, string> = { ACTIVE: "Aktif", INACTIVE: "Pasif" };

const formatGenderTR = (v: unknown) => {
    if (v == null) return "-";
    const s = String(v).trim().toUpperCase();
    if (s === "MALE") return "Erkek";
    if (s === "FEMALE") return "Kadın";
    return String(v).trim() || "-";
};

const emptyDash = (v: unknown) => {
    if (v == null) return "-";
    const s = String(v).trim();
    return s || "-";
};

const formatMaybeDateTR = (v: unknown) => {
    if (v == null) return "-";
    const s = String(v).trim();
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("tr-TR");
};

const toHumanLabel = (key: string) => {
    const spaced = key.replace(/_/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    return spaced.split(" ").filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
};

/* ══ MiniDropdown (for edit form inside table) ══════════════════════════ */
function MiniDropdown(props: {
    value: string;
    options: DropdownOption[];
    placeholder: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const { value, options, placeholder, onChange, disabled } = props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(v => !v)}
                className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition outline-none
                    ${disabled
                        ? "border-slate-700/50 bg-slate-900/20 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 bg-slate-800/60 text-white hover:border-sky-400/60 focus:border-sky-400/70"}`}
            >
                <span className={selected ? "text-white truncate" : "text-slate-400 truncate"}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="text-slate-500 shrink-0 text-xs">{open ? "▴" : "▾"}</span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border border-slate-600 bg-[#0d1117] shadow-[0_16px_60px_rgba(0,0,0,0.8)]">
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                        {options.length === 0 && <p className="px-3 py-2.5 text-sm text-slate-500">Seçenek yok</p>}
                        {options.map(opt => (
                            <button key={opt.value} type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${opt.value === value ? "bg-sky-500/25 text-sky-200 font-medium" : "text-slate-200 hover:bg-slate-700/60"}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

import { useRef } from "react";

/* ══ SortIcon ═══════════════════════════════════════════════════════════ */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    return (
        <span className={`inline-flex flex-col ml-1.5 shrink-0 ${active ? "opacity-100" : "opacity-30"}`}>
            <svg className={`w-2 h-2 -mb-0.5 ${active && dir === "asc" ? "text-sky-400" : "text-slate-400"}`} viewBox="0 0 6 4" fill="currentColor"><path d="M3 0L6 4H0z" /></svg>
            <svg className={`w-2 h-2 ${active && dir === "desc" ? "text-sky-400" : "text-slate-400"}`} viewBox="0 0 6 4" fill="currentColor"><path d="M3 4L0 0h6z" /></svg>
        </span>
    );
}

/* ══ EmployeeListPage ═══════════════════════════════════════════════════ */
const EmployeeListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

    /* Sort */
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    /* Expand / Edit */
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: "", lastName: "", email: "",
        positionName: "", departmentId: "", subDepartmentId: "",
        status: "ACTIVE", gender: "",
    });

    /* ── Fetches ── */
    useEffect(() => {
        let alive = true;
        getAllEmployees()
            .then((data: unknown) => { if (alive) setEmployees(Array.isArray(data) ? data : []); })
            .catch(err => { console.error(err); if (alive) setError("Çalışanlar alınamadı"); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        getDepartments()
            .then((data: unknown) => {
                const list: DepartmentResponse[] = Array.isArray(data) ? data : (data as any)?.content ?? [];
                setDepartments(list);
            })
            .catch(console.error);
    }, []);

    // Backend'den departmentName gelmiyorsa, departmentId üzerinden eşleştir
    const enrichedEmployees = useMemo(() => {
        if (departments.length === 0) return employees;
        return employees.map(emp => {
            // departmentName zaten doluysa dokunma
            if (emp.departmentName) return emp;
            // departmentId varsa departments listesinden isim bul
            const deptId = emp.departmentId ?? (emp as any).department?.id;
            if (!deptId) return emp;
            const dept = departments.find(d => String(d.id) === String(deptId));
            return dept ? { ...emp, departmentName: dept.name } : emp;
        });
    }, [employees, departments]);

    useEffect(() => {
        const state = location.state as { employeeCreated?: boolean; createdEmployeeName?: string } | null;
        if (state?.employeeCreated) {
            const name = state.createdEmployeeName?.trim();
            setSuccessMessage(name ? `${name} başarıyla oluşturuldu.` : "Çalışan başarıyla oluşturuldu.");
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    /* ── Filter + Sort ── */
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        let list = q
            ? enrichedEmployees.filter(emp =>
                Object.values(emp).map(v => v == null ? "" : String(v)).join(" ").toLowerCase().includes(q))
            : [...enrichedEmployees];

        if (sortKey) {
            list.sort((a, b) => {
                const as = String(a[sortKey] ?? "").toLowerCase();
                const bs = String(b[sortKey] ?? "").toLowerCase();
                return sortDir === "asc" ? as.localeCompare(bs, "tr") : bs.localeCompare(as, "tr");
            });
        }
        return list;
       }, [search, enrichedEmployees, sortKey, sortDir]);
    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    /* ── Edit cascade options ── */
    const deptOptions: DropdownOption[] = useMemo(
        () => departments.map(d => ({ value: String(d.id), label: d.name })),
        [departments]
    );
    const editSelectedDept = useMemo(
        () => departments.find(d => String(d.id) === editForm.departmentId) ?? null,
        [departments, editForm.departmentId]
    );
    const subDeptOptions: DropdownOption[] = useMemo(
        () => (editSelectedDept?.subDepartments ?? []).map(s => ({ value: String(s.id), label: s.name })),
        [editSelectedDept]
    );
    const editSelectedSubDept = useMemo(
        () => (editSelectedDept?.subDepartments ?? []).find(s => String(s.id) === editForm.subDepartmentId) ?? null,
        [editSelectedDept, editForm.subDepartmentId]
    );
    const positionOptions: DropdownOption[] = useMemo(
        () => (editSelectedSubDept?.positions ?? []).map(p => ({ value: p.name, label: p.name })),
        [editSelectedSubDept]
    );

    const statusOpts: DropdownOption[] = [
        { value: "ACTIVE", label: "Aktif" },
        { value: "INACTIVE", label: "Pasif" },
    ];
    const genderOpts: DropdownOption[] = [
        { value: "", label: "Belirtilmedi" },
        { value: "MALE", label: "Erkek" },
        { value: "FEMALE", label: "Kadın" },
    ];

    /* ── Edit actions ── */
    const startEdit = (emp: Employee) => {
        // enrichedEmployees içinden bu çalışanı bul (departmentName normalize edilmiş olabilir)
        const enriched = enrichedEmployees.find(e => e.id === emp.id) ?? emp;
        const matchedDept = departments.find(
            d => d.name?.toLowerCase() === String(enriched.departmentName ?? "").toLowerCase()
        );
        let matchedSubDept: SubDepartmentResponse | null = null;
        if (matchedDept) {
            for (const sub of matchedDept.subDepartments ?? []) {
                if (sub.positions?.some(p => p.name === enriched.positionName)) {
                    matchedSubDept = sub;
                    break;
                }
            }
        }
        setEditingId(emp.id);
        setExpandedId(null);
        setEditForm({
            firstName: String(enriched.firstName ?? ""),
            lastName: String(enriched.lastName ?? ""),
            email: String(enriched.email ?? ""),
            positionName: String(enriched.positionName ?? ""),
            departmentId: matchedDept ? String(matchedDept.id) : "",
            subDepartmentId: matchedSubDept ? String(matchedSubDept.id) : "",
            status: String(enriched.status ?? "ACTIVE"),
            gender: String(enriched.gender ?? ""),
        });
    };

    const cancelEdit = () => { setEditingId(null); setSavingId(null); };

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
            setEmployees(prev => prev.map(emp =>
                emp.id === empId
                    ? { ...emp, ...payload, ...(updated && typeof updated === "object" ? updated : {}) }
                    : emp
            ));
            setSuccessMessage("Çalışan bilgileri güncellendi.");
            setEditingId(null);
        } catch (err) {
            console.error(err);
            setError("Çalışan güncellenemedi");
        } finally {
            setSavingId(null);
        }
    };

    /* ── Labels / exclusions ── */
    const labelTR: Record<string, string> = useMemo(() => ({
        hireDate: "İşe Giriş Tarihi", gender: "Cinsiyet", phoneNumber: "Telefon",
        address: "Adres", city: "Şehir", country: "Ülke", zipCode: "Posta Kodu",
        positionName: "Pozisyon", departmentName: "Departman", status: "Durum",
        createdAt: "Oluşturma Tarihi", updatedAt: "Güncelleme Tarihi",
    }), []);

    const excludedFromExtra = useMemo(() => new Set<string>([
        "id", "firstName", "lastName", "email", "status",
        "positionName", "departmentName", "hireDate", "gender",
    ]), []);

    if (loading) return <div className="text-slate-400 p-6">Çalışanlar yükleniyor...</div>;

    /* ── Th helper ── */
    const Th = ({ children, sk, right }: { children: React.ReactNode; sk?: SortKey; right?: boolean }) => (
        <th
            onClick={() => sk && handleSort(sk)}
            className={`p-3 text-left whitespace-nowrap select-none
                ${sk ? "cursor-pointer hover:text-sky-300 transition-colors" : ""}
                ${right ? "text-right" : ""}`}
        >
            <span className="inline-flex items-center">
                {children}
                {sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
            </span>
        </th>
    );

    return (
        <div className="w-full flex flex-col gap-6 px-3 sm:px-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-semibold">Çalışanlar</h1>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => navigate("/app/employees/create")}
                        className="bg-sky-500 hover:bg-sky-400 px-5 py-2 rounded-lg text-sm font-semibold text-white transition shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                    >
                        + Çalışan Ekle
                    </button>
                    <input
                        type="text" placeholder="Ara..."
                        className="w-[260px] max-w-full rounded-lg bg-slate-900/50 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    ✓ {successMessage}
                </div>
            )}

            {/* ── Table ── */}
            <div className="rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1240px]">
                        <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide">
                        <tr>
                            <Th sk="firstName">Ad Soyad</Th>
                            <Th sk="email">E-posta</Th>
                            <Th sk="positionName">Pozisyon</Th>
                            <Th sk="departmentName">Departman</Th>
                            <Th sk="hireDate">İşe Giriş</Th>
                            <Th sk="gender">Cinsiyet</Th>
                            <Th sk="status">Durum</Th>
                            <Th right>İşlemler</Th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.map((emp) => {
                            const isOpen = expandedId === emp.id;
                            const isEditing = editingId === emp.id;
                            const extraEntries = Object.entries(emp).filter(([k, v]) => !excludedFromExtra.has(k) && v !== undefined);

                            return (
                                <Fragment key={emp.id}>
                                    {/* ── Main row ── */}
                                    <tr
                                        onClick={() => { if (!isEditing) setExpandedId(p => p === emp.id ? null : emp.id); }}
                                        className={`border-t border-slate-700/70 transition
                                            ${isEditing ? "bg-slate-800/40" : "cursor-pointer hover:bg-slate-800/30"}`}
                                    >
                                        <td className="p-3 font-medium text-slate-200">
                                            <span className="flex items-center gap-1.5">
                                                {emp.firstName} {emp.lastName}
                                                {!isEditing && (
                                                    <span className="text-slate-600 text-xs">{isOpen ? "▾" : "▸"}</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-300">{emp.email}</td>
                                        <td className="p-3 text-slate-300">{emptyDash(emp.positionName)}</td>
                                        <td className="p-3 text-slate-300">{emptyDash(emp.departmentName)}</td>
                                        <td className="p-3 text-slate-300">{formatMaybeDateTR(emp.hireDate)}</td>
                                        <td className="p-3 text-slate-300">{formatGenderTR(emp.gender)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusStyles[emp.status] ?? ""}`}>
                                                {statusLabelTR[emp.status] ?? emp.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    isEditing ? cancelEdit() : startEdit(emp);
                                                }}
                                                title={isEditing ? "İptal" : "Güncelle"}
                                                className={`inline-flex items-center justify-center rounded-lg border p-2 transition
                                                    ${isEditing
                                                        ? "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-400 hover:text-red-300"
                                                        : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-sky-400/60 hover:text-sky-300"}`}
                                            >
                                                {isEditing ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* ══ EDIT PANEL ══════════════════════════════════════════ */}
                                    {isEditing && (
                                        <tr>
                                            <td colSpan={8} className="border-t border-slate-700/50 bg-slate-900/70">
                                                <div className="px-6 py-6">
                                                    <div className="rounded-2xl border border-slate-600/80 bg-[#0d1117] shadow-[0_8px_48px_rgba(0,0,0,0.6)]">
                                                        {/* Panel header */}
                                                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-700/60 bg-slate-800/30 rounded-t-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-6 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                                                <div>
                                                                    <p className="text-base font-semibold text-white">
                                                                        {emp.firstName} {emp.lastName}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">Çalışan bilgilerini düzenle</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2.5">
                                                                <button type="button" onClick={cancelEdit}
                                                                    className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition">
                                                                    Vazgeç
                                                                </button>
                                                                <button type="button" disabled={savingId === emp.id}
                                                                    onClick={() => saveEdit(emp.id)}
                                                                    className="px-5 py-2 text-sm rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold transition flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.25)]">
                                                                    {savingId === emp.id ? (
                                                                        <>
                                                                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                                            </svg>
                                                                            Kaydediliyor...
                                                                        </>
                                                                    ) : "Kaydet"}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-7 flex flex-col gap-8">
                                                            {/* ── Kişisel Bilgiler ── */}
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                    Kişisel Bilgiler
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Ad</label>
                                                                        <input value={editForm.firstName}
                                                                            onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                                                                            className="rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/20 transition"
                                                                            placeholder="Ad" />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Soyad</label>
                                                                        <input value={editForm.lastName}
                                                                            onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                                                                            className="rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/20 transition"
                                                                            placeholder="Soyad" />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">E-posta</label>
                                                                        <input type="email" value={editForm.email}
                                                                            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                                                            className="rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/20 transition"
                                                                            placeholder="E-posta" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ── Organizasyon ── */}
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Organizasyon</p>
                                                                    {/* Step badges */}
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        {[
                                                                            { step: 1, label: "Departman", done: !!editForm.departmentId },
                                                                            { step: 2, label: "Alt Departman", done: !!editForm.subDepartmentId },
                                                                            { step: 3, label: "Pozisyon", done: !!editForm.positionName },
                                                                        ].map((s, i, arr) => (
                                                                            <span key={s.step} className="flex items-center gap-1.5">
                                                                                <span className={`flex items-center gap-1 ${s.done ? "text-sky-400" : "text-slate-600"}`}>
                                                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${s.done ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-500"}`}>
                                                                                        {s.done ? "✓" : s.step}
                                                                                    </span>
                                                                                    {s.label}
                                                                                </span>
                                                                                {i < arr.length - 1 && <span className="text-slate-700">›</span>}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Departman</label>
                                                                        <MiniDropdown
                                                                            value={editForm.departmentId}
                                                                            options={deptOptions}
                                                                            placeholder="Departman seçin"
                                                                            onChange={v => setEditForm(p => ({ ...p, departmentId: v, subDepartmentId: "", positionName: "" }))}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Alt Departman</label>
                                                                        <MiniDropdown
                                                                            value={editForm.subDepartmentId}
                                                                            options={subDeptOptions}
                                                                            placeholder={!editForm.departmentId ? "Önce departman seçin" : "Alt departman seçin"}
                                                                            disabled={!editForm.departmentId || subDeptOptions.length === 0}
                                                                            onChange={v => setEditForm(p => ({ ...p, subDepartmentId: v, positionName: "" }))}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Pozisyon</label>
                                                                        <MiniDropdown
                                                                            value={editForm.positionName}
                                                                            options={positionOptions}
                                                                            placeholder={!editForm.subDepartmentId ? "Önce alt departman seçin" : "Pozisyon seçin"}
                                                                            disabled={!editForm.subDepartmentId || positionOptions.length === 0}
                                                                            onChange={v => setEditForm(p => ({ ...p, positionName: v }))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ── Durum & Cinsiyet ── */}
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                    Durum & Cinsiyet
                                                                    <span className="h-px flex-1 bg-slate-700/60" />
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Durum</label>
                                                                        <MiniDropdown
                                                                            value={editForm.status}
                                                                            options={statusOpts}
                                                                            placeholder="Durum seçin"
                                                                            onChange={v => setEditForm(p => ({ ...p, status: v }))}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-xs font-medium text-slate-400">Cinsiyet</label>
                                                                        <MiniDropdown
                                                                            value={editForm.gender}
                                                                            options={genderOpts}
                                                                            placeholder="Cinsiyet seçin"
                                                                            onChange={v => setEditForm(p => ({ ...p, gender: v }))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* ══ EXPAND PANEL ════════════════════════════════════════ */}
                                    {isOpen && !isEditing && (
                                        <tr>
                                            <td colSpan={8} className="border-t border-slate-700/50 bg-slate-900/25 p-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                                    {[
                                                        { label: "Pozisyon", value: emptyDash(emp.positionName) },
                                                        { label: "Departman", value: emptyDash(emp.departmentName) },
                                                        { label: "İşe Giriş", value: formatMaybeDateTR(emp.hireDate) },
                                                        { label: "Cinsiyet", value: formatGenderTR(emp.gender) },
                                                        { label: "Durum", value: statusLabelTR[emp.status] ?? emp.status },
                                                    ].map(({ label, value }) => (
                                                        <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                                            <div className="text-[10px] text-slate-500 mb-1">{label}</div>
                                                            <div className="text-sm text-slate-200 font-medium">{value}</div>
                                                        </div>
                                                    ))}
                                                    {extraEntries.map(([key, value]) => {
                                                        const label = labelTR[key] ?? toHumanLabel(key);
                                                        const kl = key.toLowerCase();
                                                        const display = kl.includes("date") || kl.includes("hire")
                                                            ? formatMaybeDateTR(value)
                                                            : Array.isArray(value) ? value.join(", ")
                                                            : typeof value === "boolean" ? (value ? "Evet" : "Hayır")
                                                            : emptyDash(value);
                                                        return (
                                                            <div key={key} className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                                                <div className="text-[10px] text-slate-500 mb-1">{label}</div>
                                                                <div className="text-sm text-slate-200 font-medium break-words">{display}</div>
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
                    <div className="p-8 text-center text-slate-500 text-sm">
                        {search ? `"${search}" için sonuç bulunamadı` : "Henüz çalışan yok"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeListPage;