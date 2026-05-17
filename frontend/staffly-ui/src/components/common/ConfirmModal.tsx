import type { ReactNode } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    ShieldAlert,
    Trash2,
    X,
} from "lucide-react";

export type ConfirmModalVariant =
    | "danger"
    | "warning"
    | "info"
    | "success";

type ConfirmModalProps = {
    isOpen: boolean;

    title: string;
    description?: string;
    detailText?: string;
    itemName?: string;

    confirmText?: string;
    cancelText?: string;

    variant?: ConfirmModalVariant;
    isLoading?: boolean;

    icon?: ReactNode;

    onClose: () => void;
    onConfirm: () => void;
};

const variantStyles: Record<
    ConfirmModalVariant,
    {
        iconBox: string;
        iconText: string;
        itemBox: string;
        itemLabel: string;
        confirmButton: string;
        defaultIcon: ReactNode;
    }
> = {
    danger: {
        iconBox: "border-red-400/25 bg-red-500/15",
        iconText: "text-red-300",
        itemBox: "border-red-400/20 bg-red-500/10",
        itemLabel: "text-red-300",
        confirmButton:
            "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_16px_35px_rgba(239,68,68,0.25)]",
        defaultIcon: <Trash2 className="h-6 w-6" />,
    },
    warning: {
        iconBox: "border-amber-400/25 bg-amber-500/15",
        iconText: "text-amber-300",
        itemBox: "border-amber-400/20 bg-amber-500/10",
        itemLabel: "text-amber-300",
        confirmButton:
            "bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_16px_35px_rgba(245,158,11,0.25)]",
        defaultIcon: <AlertTriangle className="h-6 w-6" />,
    },
    info: {
        iconBox: "border-sky-400/25 bg-sky-500/15",
        iconText: "text-sky-300",
        itemBox: "border-sky-400/20 bg-sky-500/10",
        itemLabel: "text-sky-300",
        confirmButton:
            "bg-gradient-to-r from-sky-500 to-indigo-600 shadow-[0_16px_35px_rgba(14,165,233,0.25)]",
        defaultIcon: <Info className="h-6 w-6" />,
    },
    success: {
        iconBox: "border-emerald-400/25 bg-emerald-500/15",
        iconText: "text-emerald-300",
        itemBox: "border-emerald-400/20 bg-emerald-500/10",
        itemLabel: "text-emerald-300",
        confirmButton:
            "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_16px_35px_rgba(16,185,129,0.25)]",
        defaultIcon: <CheckCircle2 className="h-6 w-6" />,
    },
};

const ConfirmModal = ({
                          isOpen,
                          title,
                          description,
                          detailText,
                          itemName,
                          confirmText = "Onayla",
                          cancelText = "Vazgeç",
                          variant = "info",
                          isLoading = false,
                          icon,
                          onClose,
                          onConfirm,
                      }: ConfirmModalProps) => {
    if (!isOpen) return null;

    const styles = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
            onClick={isLoading ? undefined : onClose}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${styles.iconBox} ${styles.iconText}`}
                        >
                            {icon || styles.defaultIcon}
                        </div>

                        <div>
                            <h2 className="text-lg font-extrabold text-white">
                                {title}
                            </h2>

                            {description && (
                                <p className="mt-1 text-sm leading-5 text-slate-400">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {itemName && (
                    <div className={`mx-6 mt-5 rounded-2xl border px-4 py-3 ${styles.itemBox}`}>
                        <p className={`text-xs font-bold uppercase tracking-wide ${styles.itemLabel}`}>
                            İşlem Yapılacak Kayıt
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                            {itemName}
                        </p>
                    </div>
                )}

                {detailText && (
                    <div className="px-6 py-5">
                        <div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                            <p className="text-sm leading-6 text-slate-400">
                                {detailText}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmButton}`}
                    >
                        {isLoading ? "İşleniyor..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;