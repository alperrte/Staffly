import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface AppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    contentClassName?: string;
}

export function AppModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    contentClassName,
}: AppModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm" />
                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-[75] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_32px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl",
                        contentClassName
                    )}
                >
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-lg font-semibold text-slate-50">
                                {title}
                            </Dialog.Title>
                            {description ? (
                                <Dialog.Description className="mt-1 text-sm text-slate-400">
                                    {description}
                                </Dialog.Description>
                            ) : null}
                        </div>
                        <Dialog.Close asChild>
                            <button
                                className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-slate-300 transition hover:border-sky-400/60 hover:text-white"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
