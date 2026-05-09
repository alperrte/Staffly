import { useState, useEffect, useRef } from "react";
import type { Employee } from "../../types/employeeTypes";

interface EmployeeActionsModalProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (emp: Employee) => void;
    onDelete: (empId: number) => void;
    canEdit: boolean;
    canDelete: boolean;
    isDeletingId: number | null;
}

export const EmployeeActionsModal = ({
    employee,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    isDeletingId,
}: EmployeeActionsModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !employee) return null;

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        onDelete(employee.id);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-200">
                        {employee.firstName} {employee.lastName}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">
                            Temel Bilgiler
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">E-posta</p>
                                <p className="text-sm text-slate-200">{employee.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Durum</p>
                                <p className="text-sm text-slate-200 capitalize">{employee.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Info */}
                    <div>
                        <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">
                            İş Bilgileri
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Departman</p>
                                <p className="text-sm text-slate-200">{employee.departmentName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Alt Departman</p>
                                <p className="text-sm text-slate-200">{employee.subDepartmentName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Pozisyon</p>
                                <p className="text-sm text-slate-200">{employee.positionName || "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <h3 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">
                            Kişisel Bilgiler
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Telefon</p>
                                <p className="text-sm text-slate-200">{employee.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Doğum Tarihi</p>
                                <p className="text-sm text-slate-200">
                                    {employee.birthDate
                                        ? new Date(employee.birthDate).toLocaleDateString("tr-TR")
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Cinsiyet</p>
                                <p className="text-sm text-slate-200">
                                    {employee.gender === "MALE"
                                        ? "Erkek"
                                        : employee.gender === "FEMALE"
                                          ? "Kadın"
                                          : employee.gender || "-"}
                                </p>
                            </div>
                            {employee.medeniDurum && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Medeni Durum</p>
                                    <p className="text-sm text-slate-200">{employee.medeniDurum}</p>
                                </div>
                            )}
                            {employee.tc && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">TC Kimlik No</p>
                                    <p className="text-sm text-slate-200">{employee.tc}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 z-10 flex gap-2 px-6 py-4 bg-slate-900/95 border-t border-slate-700">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => {
                                onEdit(employee);
                                onClose();
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/50 bg-sky-500/15 px-4 py-2.5 text-sm font-medium text-sky-300 hover:border-sky-400 hover:bg-sky-500/25 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Düzenle
                        </button>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            onClick={handleDeleteConfirm}
                            disabled={isDeletingId === employee.id}
                            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                                isDeleting || isDeletingId === employee.id
                                    ? "border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed"
                                    : "border-red-500/50 bg-red-500/15 text-red-300 hover:border-red-400 hover:bg-red-500/25"
                            }`}
                        >
                            {isDeletingId === employee.id ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Siliniyor...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Sil
                                </>
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </>
    );
};
