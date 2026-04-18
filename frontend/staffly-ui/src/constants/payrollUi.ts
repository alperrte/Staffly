export const PAYROLL_CURRENCY_OPTIONS = [
    { value: "TRY", label: "TRY — Türk lirası" },
    { value: "USD", label: "USD — ABD doları" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — İngiliz sterlini" },
] as const;

export function buildYearOptions(): { value: string; label: string }[] {
    const y = new Date().getFullYear();
    const start = y - 5;
    const end = y + 2;
    const out: { value: string; label: string }[] = [];
    for (let i = start; i <= end; i++) {
        out.push({ value: String(i), label: String(i) });
    }
    return out;
}
