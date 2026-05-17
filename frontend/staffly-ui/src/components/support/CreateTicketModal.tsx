import { AlertTriangle, Building2, ClipboardList, Flag, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateTicketMutation } from "../../hooks/useTickets";
import { getDepartments } from "../../services/departmentService";
import type { Department } from "../../types/departmentTypes";
import type { TicketPriority } from "../../types/ticket";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AppModal } from "./AppModal";

const categoryOptions = [
    { id: 1, name: "Teknik Destek" },
    { id: 2, name: "Bordro / Maaş" },
    { id: 3, name: "İzin İşlemleri" },
    { id: 4, name: "Görev Yönetimi" },
    { id: 5, name: "Hesap / Erişim" },
    { id: 6, name: "Diğer" },
] as const;

const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const priorityLabels: Record<TicketPriority, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    CRITICAL: "Kritik",
};

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
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentId, setDepartmentId] = useState<number | null>(null);

    useEffect(() => {
        getDepartments()
            .then((rows) => {
                setDepartments(rows);
                setDepartmentId((current) => current ?? rows[0]?.id ?? null);
            })
            .catch(() => setDepartments([]));
    }, []);

    const errors = useMemo(() => {
        return {
            title: title.trim().length < 5 ? "Başlık en az 5 karakter olmalı." : "",
            description:
                description.trim().length < 15
                    ? "Açıklama en az 15 karakter olmalı."
                    : "",
            department: departmentId == null ? "Departman seçimi zorunludur." : "",
        };
    }, [departmentId, description, title]);

    const isValid = !errors.title && !errors.description && !errors.department;

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategoryId(categoryOptions[0].id);
        setPriority("MEDIUM");
        setDepartmentId(departments[0]?.id ?? null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid) return;

        try {
            await createMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                categoryId,
                departmentId: departmentId as number,
                priority,
            });

            toast.success("Destek talebi başarıyla oluşturuldu.");
            resetForm();
            onOpenChange(false);
        } catch {
            toast.error("Destek talebi oluşturulamadı. Lütfen tekrar deneyin.");
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Yeni Destek Talebi"
            description="Talebinizi doğru departmana iletmek için kategori, öncelik ve açıklama bilgilerini eksiksiz doldurun."
            contentClassName="max-w-3xl"
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <ClipboardList className="h-3.5 w-3.5 text-sky-300" />
                                Talep Başlığı
                            </label>

                            <Input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Örn: Maaş bordrom görüntülenmiyor"
                                className="h-11 rounded-2xl border-white/10 bg-slate-900/70"
                            />

                            {errors.title ? (
                                <p className="mt-1.5 text-xs text-rose-300">{errors.title}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <AlertTriangle className="h-3.5 w-3.5 text-sky-300" />
                                Açıklama
                            </label>

                            <Textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Yaşadığınız problemi, beklenen çözümü ve varsa ekran görüntüsü bilgisini yazın..."
                                className="min-h-40 rounded-2xl border-white/10 bg-slate-900/70"
                            />

                            {errors.description ? (
                                <p className="mt-1.5 text-xs text-rose-300">
                                    {errors.description}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                        <h3 className="text-sm font-bold text-white">Talep Bilgileri</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            Seçtiğiniz bilgiler talebin doğru ekibe yönlendirilmesi için kullanılır.
                        </p>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    <Building2 className="h-3.5 w-3.5 text-sky-300" />
                                    Departman
                                </label>

                                <select
                                    value={departmentId ?? ""}
                                    onChange={(event) =>
                                        setDepartmentId(Number(event.target.value))
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/20"
                                >
                                    {departments.length === 0 ? (
                                        <option value="" className="bg-slate-950">
                                            Departman bulunamadı
                                        </option>
                                    ) : (
                                        departments.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                                className="bg-slate-950"
                                            >
                                                {item.name}
                                            </option>
                                        ))
                                    )}
                                </select>

                                {errors.department ? (
                                    <p className="mt-1.5 text-xs text-rose-300">
                                        {errors.department}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    <ClipboardList className="h-3.5 w-3.5 text-sky-300" />
                                    Kategori
                                </label>

                                <select
                                    value={categoryId}
                                    onChange={(event) =>
                                        setCategoryId(Number(event.target.value))
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/20"
                                >
                                    {categoryOptions.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                            className="bg-slate-950"
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    <Flag className="h-3.5 w-3.5 text-sky-300" />
                                    Öncelik
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    {priorities.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setPriority(item)}
                                            className={`rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                                                priority === item
                                                    ? "border-sky-400/60 bg-sky-400/15 text-sky-100"
                                                    : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                                            }`}
                                        >
                                            {priorityLabels[item]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        type="submit"
                        disabled={!isValid || createMutation.isPending}
                        className="shadow-[0_16px_36px_rgba(14,165,233,0.18)]"
                    >
                        <SendHorizonal className="h-4 w-4" />
                        {createMutation.isPending ? "Oluşturuluyor..." : "Talep Oluştur"}
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}