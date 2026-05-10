import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Mail, Building2 } from "lucide-react";
import { UNSPECIFIED_LABEL } from "../../types/employeeTypes";
import type { NormalizedEmployee } from "../../types/employeeTypes";

interface EmployeeActionsModalProps {
    employee: NormalizedEmployee | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (emp: NormalizedEmployee) => void;
    canEdit: boolean;
}

const EmployeeActionsModal = ({
    employee,
    isOpen,
    onClose,
    onEdit,
    canEdit,
}: EmployeeActionsModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !employee) return null;

    const fullName = employee.basicInfo.fullName || `${employee.firstName} ${employee.lastName}`.trim();
    const initials = employee.mediaInfo.initials || `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase();
    const photoUrl = employee.profilePhotoUrl || employee.mediaInfo.profilePhotoUrl;
    const statusLabel = employee.basicInfo.statusLabel || employee.status || "Belirtilmemiş";
    const statusKey = String(employee.status || "").toUpperCase();
    const statusTone = statusKey === "ACTIVE"
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : statusKey === "INACTIVE" || statusKey === "PASSIVE"
            ? "bg-red-500/15 text-red-300 border-red-500/30"
            : statusKey === "LEAVE"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-slate-500/15 text-slate-300 border-slate-500/30";
    const statusText = statusKey === "ACTIVE"
        ? "Aktif"
        : statusKey === "INACTIVE" || statusKey === "PASSIVE"
            ? "Pasif"
            : statusKey === "LEAVE"
                ? "İzinli"
                : statusLabel;
    const titleLabel = employee.organizationInfo.titleName || employee.organizationInfo.positionName || UNSPECIFIED_LABEL;
    const birthday = employee.workInfo.birthDate && employee.workInfo.birthDate !== UNSPECIFIED_LABEL
        ? new Intl.DateTimeFormat("tr-TR").format(new Date(employee.workInfo.birthDate))
        : UNSPECIFIED_LABEL;
    const genderLabel = employee.workInfo.gender === "MALE"
        ? "Erkek"
        : employee.workInfo.gender === "FEMALE"
            ? "Kadın"
            : employee.workInfo.gender || UNSPECIFIED_LABEL;
    const maritalStatusLabel = employee.workInfo.medeniDurum === "SINGLE"
        ? "Bekar"
        : employee.workInfo.medeniDurum === "MARRIED"
            ? "Evli"
            : employee.workInfo.medeniDurum || UNSPECIFIED_LABEL;
    const detailItem = (label: string, value: string) => (
        <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <div className="break-words text-[15px] font-semibold leading-snug text-white">{value}</div>
        </div>
    );

    return createPortal(
        <>
            <div className="fixed inset-0 z-40 bg-slate-950/80" onClick={onClose} />

            <div
                ref={modalRef}
                className="fixed right-4 top-1/2 z-50 flex w-[min(92vw,520px)] -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,rgba(8,15,27,0.98),rgba(4,10,20,0.98))] text-white shadow-[0_0_90px_rgba(0,0,0,0.65)] max-h-[calc(100vh-1rem)]"
            >
                <div className="px-5 pt-4 pb-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="flex h-16 w-16 overflow-hidden rounded-full border-4 border-white/10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">{initials || "?"}</div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#020817] bg-emerald-400" />
                            </div>

                            <div>
                                <h2 className="text-[22px] font-semibold leading-tight text-white">{fullName}</h2>
                                <p className="mt-1 text-[11px] text-slate-300">{titleLabel}</p>
                                <div className={`mt-1 inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-[10px] font-medium ${statusTone}`}>
                                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                    {statusText}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
                    <div className="grid gap-2.5">
                        <section className="rounded-[18px] border border-cyan-500/20 bg-cyan-500/8 px-4 py-3">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-white">Genel Bilgiler</h3>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                {detailItem("Çalışan Kodu", employee.basicInfo.employeeCode)}
                                {detailItem("TC Kimlik No", employee.workInfo.tc)}
                                {detailItem("Doğum Tarihi", birthday)}
                                {detailItem("Cinsiyet", genderLabel)}
                                {detailItem("Medeni Durum", maritalStatusLabel)}
                            </div>
                        </section>

                        <section className="rounded-[18px] border border-purple-500/20 bg-purple-500/8 px-4 py-3">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10">
                                    <Mail className="h-4 w-4 text-purple-300" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-white">İletişim Bilgileri</h3>
                            </div>
                            <div className="mt-3 space-y-2">
                                {detailItem("E-posta", employee.contactInfo.email)}
                                {detailItem("Telefon", employee.contactInfo.phone)}
                            </div>
                        </section>

                        <section className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                                    <Building2 className="h-4 w-4 text-emerald-300" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-white">Organizasyon Bilgileri</h3>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {detailItem("Departman", employee.organizationInfo.departmentName)}
                                {detailItem("Alt Departman", employee.organizationInfo.subDepartmentName)}
                                {detailItem("Pozisyon", employee.organizationInfo.positionName)}
                            </div>
                        </section>

                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onEdit(employee);
                                    onClose();
                                }}
                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-400/50 bg-violet-500/10 px-4 py-3 text-[14px] font-semibold text-violet-200 transition hover:border-violet-300/80 hover:bg-violet-500/15"
                            >
                                Profili Düzenle
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export { EmployeeActionsModal };
export default EmployeeActionsModal;