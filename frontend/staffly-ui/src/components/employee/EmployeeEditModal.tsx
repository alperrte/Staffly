import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X, User, Mail, Phone, ShieldCheck, Calendar, Heart, Building2, Briefcase, Activity } from "lucide-react";
import type { Department, DepartmentPosition, NormalizedEmployee, SubDepartment } from "../../types/employeeTypes";
import type { ReactNode } from "react";

export type EmployeeEditFormState = {
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
    subDepartmentId: string;
    positionId: string;
    status: string;
    phone: string;
    tc: string;
    birthDate: string;
    gender: string;
    medeniDurum: string;
};

interface EmployeeEditModalProps {
    isOpen: boolean;
    employee: NormalizedEmployee | null;
    form: EmployeeEditFormState;
    departments: Department[];
    subDepartments: SubDepartment[];
    positions: DepartmentPosition[];
    isSaving?: boolean;
    onClose: () => void;
    onSave: () => void;
    onChange: (next: EmployeeEditFormState) => void;
    onDepartmentChange: (departmentId: string) => void | Promise<void>;
    onSubDepartmentChange: (subDepartmentId: string) => void | Promise<void>;
}

const inputClass =
    "block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/25";

const selectClass = `${inputClass} appearance-none pr-12`;

const sectionCard = "rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl";

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400";

const EditField = ({ label, icon: Icon, children }: { label: string; icon: typeof User; children: ReactNode }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <div className="relative">
            {children}
            <Icon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
    </div>
);

const EmployeeEditModal = ({
    isOpen,
    employee,
    form,
    departments,
    subDepartments,
    positions,
    isSaving = false,
    onClose,
    onSave,
    onChange,
    onDepartmentChange,
    onSubDepartmentChange,
}: EmployeeEditModalProps) => {
    if (!isOpen || !employee) return null;

    const update = (patch: Partial<EmployeeEditFormState>) => onChange({ ...form, ...patch });

    return createPortal(
        <div className="fixed inset-0 z-[70]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            />

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 220 }}
                className="absolute right-0 top-0 flex h-full max-w-[860px] w-full flex-col overflow-hidden border-l border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(180deg,rgba(6,11,23,0.98),rgba(2,6,23,0.98))] text-white shadow-[0_0_80px_rgba(0,0,0,0.55)]"
            >
                <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/85 px-6 py-5 backdrop-blur-xl md:px-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-xl font-semibold shadow-[0_0_30px_rgba(34,211,238,0.28)]">
                                {employee.mediaInfo.initials || `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase()}
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Employee Editor</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Çalışan Düzenle</h2>
                                <p className="mt-1 text-sm text-slate-400">Bilgileri section bazlı, modern bir formda güncelleyin.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className={sectionCard}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                    <User className="h-5 w-5 text-cyan-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Kişisel Bilgiler</h3>
                                    <p className="text-sm text-slate-400">Temel çalışan profili.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <EditField label="Ad" icon={User}>
                                    <input className={inputClass} value={form.firstName} onChange={(e) => update({ firstName: e.target.value })} placeholder="Ad" />
                                </EditField>
                                <EditField label="Soyad" icon={User}>
                                    <input className={inputClass} value={form.lastName} onChange={(e) => update({ lastName: e.target.value })} placeholder="Soyad" />
                                </EditField>
                                <EditField label="TC Kimlik No" icon={ShieldCheck}>
                                    <input className={inputClass} value={form.tc} onChange={(e) => update({ tc: e.target.value })} placeholder="11 haneli kimlik no" maxLength={11} />
                                </EditField>
                                <EditField label="Doğum Tarihi" icon={Calendar}>
                                    <input className={inputClass} type="date" value={form.birthDate} onChange={(e) => update({ birthDate: e.target.value })} />
                                </EditField>
                                <EditField label="Cinsiyet" icon={User}>
                                    <select className={selectClass} value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                                        <option value="">Seçiniz</option>
                                        <option value="MALE">Erkek</option>
                                        <option value="FEMALE">Kadın</option>
                                    </select>
                                </EditField>
                                <EditField label="Medeni Durum" icon={Heart}>
                                    <select className={selectClass} value={form.medeniDurum} onChange={(e) => update({ medeniDurum: e.target.value })}>
                                        <option value="">Seçiniz</option>
                                        <option value="Bekar">Bekar</option>
                                        <option value="Evli">Evli</option>
                                    </select>
                                </EditField>
                            </div>
                        </section>

                        <section className={sectionCard}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10">
                                    <Mail className="h-5 w-5 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">İletişim</h3>
                                    <p className="text-sm text-slate-400">E-posta ve telefon.</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <EditField label="E-posta" icon={Mail}>
                                    <input className={inputClass} type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="ornek@firma.com" />
                                </EditField>
                                <EditField label="Telefon" icon={Phone}>
                                    <input className={inputClass} value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+90 5xx xxx xx xx" />
                                </EditField>
                            </div>
                        </section>

                        <section className={sectionCard}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                                    <Building2 className="h-5 w-5 text-emerald-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Organizasyon</h3>
                                    <p className="text-sm text-slate-400">Departman zinciri ve pozisyon.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <EditField label="Departman" icon={Building2}>
                                    <select className={selectClass} value={form.departmentId} onChange={(e) => onDepartmentChange(e.target.value)}>
                                        <option value="">Departman seçiniz</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </EditField>
                                <EditField label="Alt Departman" icon={Building2}>
                                    <select className={selectClass} value={form.subDepartmentId} onChange={(e) => onSubDepartmentChange(e.target.value)} disabled={!form.departmentId}>
                                        <option value="">Alt departman seçiniz</option>
                                        {subDepartments.map((subDepartment) => (
                                            <option key={subDepartment.id} value={subDepartment.id}>
                                                {subDepartment.name}
                                            </option>
                                        ))}
                                    </select>
                                </EditField>
                                <EditField label="Pozisyon" icon={Briefcase}>
                                    <select className={selectClass} value={form.positionId} onChange={(e) => update({ positionId: e.target.value })} disabled={!form.subDepartmentId}>
                                        <option value="">Pozisyon seçiniz</option>
                                        {positions.map((position) => (
                                            <option key={position.id} value={position.id}>
                                                {position.name}
                                            </option>
                                        ))}
                                    </select>
                                </EditField>
                                <EditField label="Durum" icon={Activity}>
                                    <select className={selectClass} value={form.status} onChange={(e) => update({ status: e.target.value })}>
                                        <option value="ACTIVE">Aktif</option>
                                        <option value="INACTIVE">Pasif</option>
                                        <option value="LEAVE">İzinli</option>
                                    </select>
                                </EditField>
                            </div>
                        </section>

                        <section className={sectionCard}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                                    <Briefcase className="h-5 w-5 text-amber-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Çalışma ve Sistem</h3>
                                    <p className="text-sm text-slate-400">Salt okunur sistem metası ve derivasyonlar.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Çalışan Kodu</div>
                                    <div className="mt-1 text-sm text-white">{employee.basicInfo.employeeCode}</div>
                                </div>
                                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">İşe Giriş</div>
                                    <div className="mt-1 text-sm text-white">{employee.workInfo.hireDate}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="border-t border-white/10 bg-slate-950/90 px-6 py-3 backdrop-blur-xl md:px-8">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                        >
                            İptal
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.22)] transition hover:shadow-[0_0_36px_rgba(34,211,238,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default EmployeeEditModal;