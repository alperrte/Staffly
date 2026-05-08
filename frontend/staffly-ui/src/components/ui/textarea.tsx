import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea
            className={cn(
                "min-h-28 w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/60",
                className
            )}
            {...props}
        />
    );
}
