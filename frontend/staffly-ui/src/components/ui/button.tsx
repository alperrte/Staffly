import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] hover:from-blue-500 hover:to-sky-400",
                secondary:
                    "border border-white/10 bg-slate-900/55 text-slate-100 hover:border-sky-400/50 hover:bg-slate-900/85",
                ghost: "text-slate-300 hover:bg-slate-900/60 hover:text-white",
                destructive: "bg-red-600/90 text-white hover:bg-red-500",
            },
            size: {
                sm: "h-9 px-3",
                md: "h-10 px-4",
                lg: "h-11 px-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
