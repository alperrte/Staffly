import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Camera,
    CheckCircle2,
    Copy,
    Banknote,
    FileText,
    IdCard,
    Mail,
    Pencil,
    Phone,
    ShieldCheck,
    Star,
    Trash2,
    User,
} from "lucide-react";

import {
    getMyProfile,
    normalizeEmployee,
    removeProfileImage,
    uploadProfileImage,
} from "../../services/employeeService";
import type { EmployeeApiResponse, NormalizedEmployee } from "../../types/employeeTypes";
import { getMyPayrollOverview, type EmployeePayrollOverview } from "../../services/payrollService";
import {
    getTokenRoles,
    ROLE_DEPARTMENT_MANAGER,
    ROLE_EMPLOYEE,
    ROLE_HR_MANAGER,
    ROLE_MANAGER,
    ROLE_SYSTEM_ADMIN,
} from "../../utils/auth";

type RoleProfile = {
    key: "admin" | "hr" | "manager" | "employee";
    title: string;
    subtitle: string;
};

const roleProfiles: Record<RoleProfile["key"], RoleProfile> = {
    admin: {
        key: "admin",
        title: "Yönetici Profili",
        subtitle: "Sistem ayarları, kullanıcılar ve organizasyon görünümü",
    },
    hr: {
        key: "hr",
        title: "İK Profili",
        subtitle: "İşe alım, çalışan kayıtları ve izin süreçleri",
    },
    manager: {
        key: "manager",
        title: "Yönetici Profili",
        subtitle: "Ekip yönetimi, görevler ve departman görünümü",
    },
    employee: {
        key: "employee",
        title: "Çalışan Profili",
        subtitle: "Kişisel bilgiler, çalışma bilgileri ve iletişim tercihleri",
    },
};

const statusLabelTR: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    PASSIVE: "Pasif",
    LEAVE: "İzinli",
};

const roleLabelTR: Record<string, string> = {
    [ROLE_SYSTEM_ADMIN]: "Sistem Yöneticisi",
    [ROLE_HR_MANAGER]: "İnsan Kaynakları",
    [ROLE_DEPARTMENT_MANAGER]: "Departman Yöneticisi",
    [ROLE_MANAGER]: "Yönetici",
    ROLE_EMPLOYEE: "Çalışan",
    ROLE_ACCOUNTING: "Muhasebe",
};

const genderLabelTR: Record<string, string> = {
    MALE: "Erkek",
    FEMALE: "Kadın",
    OTHER: "Diğer",
    ERKEK: "Erkek",
    KADIN: "Kadın",
    DİĞER: "Diğer",
};

const empty = (value?: string | number | null) => {
    if (value == null) return "Belirtilmemiş";
    const text = String(value).trim();
    return text || "Belirtilmemiş";
};

const formatDate = (value?: string | null) => {
    if (!value) return "Belirtilmemiş";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const formatMoney = (value?: string | number | null, currency = "TRY") => {
    if (value == null || value === "") return "Belirtilmemiş";
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) return String(value);

    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
};

const calculateTenure = (hireDate?: string | null) => {
    if (!hireDate) return "0 yıl 0 ay";

    const start = new Date(hireDate);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || start > now) {
        return "0 yıl 0 ay";
    }

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (now.getDate() < start.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return `${Math.max(years, 0)} yıl ${Math.max(months, 0)} ay`;
};

const resolveRoleProfile = (roles: string[]) => {
    if (roles.includes(ROLE_SYSTEM_ADMIN)) return roleProfiles.admin;
    if (roles.includes(ROLE_HR_MANAGER)) return roleProfiles.hr;
    if (roles.includes(ROLE_MANAGER) || roles.includes(ROLE_DEPARTMENT_MANAGER)) return roleProfiles.manager;
    if (roles.includes(ROLE_EMPLOYEE)) return roleProfiles.employee;
    return roleProfiles.employee;
};

const buildProfile = (payload: EmployeeApiResponse) => normalizeEmployee(payload);

const translateGender = (value?: string | null) => {
    const text = empty(value);
    return genderLabelTR[text.toLocaleUpperCase("tr-TR")] ?? text;
};

const InfoRow = ({
    icon: Icon,
    label,
    value,
    editable,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    editable?: ReactNode;
}) => (
    <div className="flex min-h-[72px] items-start gap-4 border-b border-white/10 py-4 last:border-b-0">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
            <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-400">{label}</p>
            {editable ?? <p className="mt-1 break-words text-sm font-semibold text-slate-100 sm:text-base">{value}</p>}
        </div>
    </div>
);

const ProfilePage = () => {
    const [profile, setProfile] = useState<NormalizedEmployee | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
    const [payrollOverview, setPayrollOverview] = useState<EmployeePayrollOverview | null>(null);

    const roles = useMemo(() => getTokenRoles(), []);
    const roleProfile = useMemo(() => resolveRoleProfile(roles), [roles]);
    const roleDisplay = useMemo(
        () => roles.map((role) => roleLabelTR[role] ?? role.replace(/^ROLE_/, "")).join(", ") || "Çalışan",
        [roles]
    );

    useEffect(() => {
        let alive = true;

        getMyProfile()
            .then((data: EmployeeApiResponse) => {
                if (!alive) return;

                const normalized = buildProfile(data);
                setProfile(normalized);
                setPreviewImage(normalized.mediaInfo.profilePhotoUrl);
            })
            .catch((fetchError) => {
                console.error(fetchError);
                if (alive) setError("Profil bilgileri alınamadı.");
            });

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;

        getMyPayrollOverview()
            .then((overview) => {
                if (alive) setPayrollOverview(overview);
            })
            .catch((payrollError) => {
                console.error(payrollError);
            });

        return () => {
            alive = false;
        };
    }, []);

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setMessage("");

        try {
            const updatedProfile = await uploadProfileImage(file);
            const normalized = buildProfile(updatedProfile);
            setProfile(normalized);
            setPreviewImage(URL.createObjectURL(file));
            setIsImageMenuOpen(false);
            setMessage("Profil fotoğrafı güncellendi.");
        } catch (uploadError) {
            console.error(uploadError);
            setError("Profil fotoğrafı yüklenemedi.");
        } finally {
            event.target.value = "";
        }
    };

    const handleRemoveImage = async () => {
        setError("");
        setMessage("");

        try {
            const updatedProfile = await removeProfileImage();
            const normalized = buildProfile(updatedProfile);
            setProfile(normalized);
            setPreviewImage(null);
            setIsImageMenuOpen(false);
            setMessage("Profil fotoğrafı kaldırıldı.");
        } catch (removeError) {
            console.error(removeError);
            setError("Profil fotoğrafı kaldırılamadı.");
        }
    };

    const copyText = async (value: string) => {
        if (!value || value === "Belirtilmemiş") return;

        try {
            await navigator.clipboard.writeText(value);
            setMessage("Bilgi panoya kopyalandı.");
        } catch {
            setError("Kopyalama yapılamadı.");
        }
    };

    if (!profile && !error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-slate-300">
                Profil yükleniyor...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-red-300">
                {error}
            </div>
        );
    }

    const fullName = profile.basicInfo.fullName || `${profile.firstName} ${profile.lastName}`.trim();
    const status = statusLabelTR[profile.status] ?? empty(profile.status);
    const imageUrl = previewImage || profile.mediaInfo.profilePhotoUrl;
    const departmentName = empty(profile.organizationInfo.departmentName);
    const positionName = empty(profile.organizationInfo.positionName);
    const hireDate = formatDate(profile.hireDate);
    const birthDate = formatDate(profile.birthDate);
    const currentSalary = payrollOverview?.currentSalary?.baseSalary ?? profile.salary;
    const salaryCurrency = payrollOverview?.currentSalary?.currency || "TRY";
    const lastNetSalary = payrollOverview?.lastNetSalary;
    const lastPayrollPeriod =
        payrollOverview?.lastPayrollMonth && payrollOverview?.lastPayrollYear
            ? `${payrollOverview.lastPayrollMonth}/${payrollOverview.lastPayrollYear}`
            : "Belirtilmemiş";
    const contactItems: Array<{
        icon: ComponentType<{ className?: string }>;
        value: string;
    }> = [
        { icon: Mail, value: empty(profile.email) },
        { icon: Phone, value: empty(profile.phone) },
    ];

    return (
        <div className="min-h-full bg-[#020817] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1540px] space-y-5">
                <header className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_0_45px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Profil</h1>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                {roleProfile.subtitle}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex h-12 items-center rounded-2xl border border-sky-400/25 bg-sky-500/10 px-5 text-sm font-semibold text-sky-200">
                                {roleDisplay}
                            </span>
                        </div>
                    </div>

                    {(message || error) && (
                        <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-400/25 bg-red-500/10 text-red-200" : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"}`}>
                            {error || message}
                        </div>
                    )}
                </header>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.9fr)]">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-7">
                        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="flex flex-col items-center lg:items-start">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (imageUrl) {
                                                setIsImageMenuOpen((current) => !current);
                                            }
                                        }}
                                        className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-sky-400/40 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-4xl font-black text-white shadow-[0_0_38px_rgba(14,165,233,0.36)] transition hover:border-sky-300/70"
                                    >
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            profile.mediaInfo.initials
                                        )}
                                    </button>

                                    {!imageUrl && (
                                        <label className="absolute bottom-3 right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-slate-900 text-sky-200 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:border-sky-400/60 hover:text-white" title="Profil fotoğrafı yükle">
                                            <Camera className="h-5 w-5" />
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}

                                    {imageUrl && isImageMenuOpen && (
                                        <div className="absolute left-1/2 top-[calc(100%+12px)] z-30 w-44 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                            <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-sky-500/10 hover:text-white">
                                                <Pencil className="h-4 w-4 text-sky-300" />
                                                Düzenle
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-200 transition hover:bg-red-500/10 hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-300" />
                                                Kaldır
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0 space-y-6">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="break-words text-3xl font-bold text-white sm:text-4xl">{fullName}</h2>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/12 px-3 py-1 text-sm font-semibold text-emerald-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            {status}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-sky-300">{positionName}</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        {departmentName}
                                    </p>
                                </div>

                                <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45 sm:grid-cols-2">
                                    <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
                                        <p className="text-sm text-slate-400">İşe Giriş Tarihi</p>
                                        <p className="mt-2 flex items-center gap-2 text-base font-bold text-white">
                                            {hireDate}
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-sm text-slate-400">Kıdem</p>
                                        <p className="mt-2 flex items-center gap-2 text-base font-bold text-white">
                                            {calculateTenure(profile.hireDate)}
                                            <Star className="h-4 w-4 text-slate-400" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-6">
                        <h3 className="text-lg font-bold text-white">İletişim Bilgileri</h3>
                        <div className="mt-4 space-y-3">
                            {contactItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.value} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3">
                                        <Icon className="h-5 w-5 shrink-0 text-sky-300" />
                                        <p className="min-w-0 flex-1 break-words text-sm font-semibold text-slate-100">{item.value}</p>
                                        <button
                                            type="button"
                                            onClick={() => copyText(item.value)}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
                                            title="Kopyala"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.42)] backdrop-blur-2xl sm:p-7">
                        <h3 className="text-xl font-bold text-white">Kişisel Bilgiler</h3>
                        <div className="mt-5 grid gap-x-10 md:grid-cols-2">
                            <InfoRow icon={User} label="Ad" value={empty(profile.firstName).toLocaleUpperCase("tr-TR")} />
                            <InfoRow icon={User} label="Soyad" value={empty(profile.lastName).toLocaleUpperCase("tr-TR")} />
                            <InfoRow icon={Mail} label="Email" value={empty(profile.email)} />
                            <InfoRow
                                icon={Phone}
                                label="Telefon"
                                value={empty(profile.phone)}
                            />
                            <InfoRow icon={CalendarDays} label="Doğum Tarihi" value={birthDate} />
                            <InfoRow icon={FileText} label="Medeni Durum" value={empty(profile.medeniDurum)} />
                            <InfoRow icon={ShieldCheck} label="Cinsiyet" value={translateGender(profile.gender)} />
                            <InfoRow icon={IdCard} label="T.C. Kimlik" value={empty(profile.tc)} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.42)] backdrop-blur-2xl sm:p-7">
                        <h3 className="text-xl font-bold text-white">Pozisyon & Departman</h3>
                        <div className="mt-6 space-y-5">
                            <div className="flex gap-4 border-b border-white/10 pb-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-300">
                                    <BriefcaseBusiness className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-400">Pozisyon</p>
                                    <p className="mt-1 break-words text-lg font-bold text-white">{positionName}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-300">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-400">Departman</p>
                                    <p className="mt-1 break-words text-lg font-bold text-white">{departmentName}</p>
                                    <p className="mt-1 text-sm text-slate-400">{empty(profile.organizationInfo.subDepartmentName)}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 border-t border-white/10 pt-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
                                    <Banknote className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-400">Maaş Bilgileri</p>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
                                            <p className="text-xs text-slate-500">Güncel brüt maaş</p>
                                            <p className="mt-1 break-words text-lg font-bold text-white">
                                                {formatMoney(currentSalary, salaryCurrency)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
                                            <p className="text-xs text-slate-500">Son net maaş</p>
                                            <p className="mt-1 break-words text-lg font-bold text-white">
                                                {formatMoney(lastNetSalary, salaryCurrency)}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">Dönem: {lastPayrollPeriod}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
