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
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />

                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-[75] w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] shadow-[0_32px_90px_rgba(2,6,23,0.72)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                        contentClassName
                    )}
                >
                    <div className="relative border-b border-white/10 px-6 py-5">
                        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-sky-500/10 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div>
                                <Dialog.Title className="text-lg font-bold text-white">
                                    {title}
                                </Dialog.Title>

                                {description ? (
                                    <Dialog.Description className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                                        {description}
                                    </Dialog.Description>
                                ) : null}
                            </div>

                            <Dialog.Close asChild>
                                <button
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-white"
                                    type="button"
                                    aria-label="Kapat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>

                    <div className="p-6">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}