import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateTicketMutation } from "../../hooks/useTickets";
import type { TicketPriority } from "../../types/ticket";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AppModal } from "./AppModal";

const categoryOptions = [
    { id: 1, name: "Technical" },
    { id: 2, name: "Payroll" },
    { id: 3, name: "Leave" },
    { id: 4, name: "Task" },
    { id: 5, name: "Account" },
    { id: 6, name: "Other" },
] as const;
const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

interface CreateTicketModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTicketModal({ open, onOpenChange }: CreateTicketModalProps) {
    const createMutation = useCreateTicketMutation();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number>(categoryOptions[0].id);
    const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

    const errors = useMemo(() => {
        return {
            title: title.trim().length < 5 ? "Title en az 5 karakter olmalı." : "",
            description: description.trim().length < 15 ? "Description en az 15 karakter olmalı." : "",
        };
    }, [description, title]);

    const isValid = !errors.title && !errors.description;

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategoryId(categoryOptions[0].id);
        setPriority("MEDIUM");
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValid) {
            return;
        }
        try {
            await createMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                categoryId,
                priority,
            });
            toast.success("Ticket başarıyla oluşturuldu.");
            resetForm();
            onOpenChange(false);
        } catch {
            toast.error("Ticket oluşturulamadı. Lütfen tekrar deneyin.");
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Create Support Ticket"
            description="HR operasyonlarında hızlı destek talebi oluşturun."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VPN access issue..." />
                    {errors.title ? <p className="mt-1 text-xs text-red-300">{errors.title}</p> : null}
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Description</label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Issue details and expected resolution..."
                    />
                    {errors.description ? <p className="mt-1 text-xs text-red-300">{errors.description}</p> : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/60"
                        >
                            {categoryOptions.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TicketPriority)}
                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/60"
                        >
                            {priorities.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!isValid || createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Ticket"}
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}
