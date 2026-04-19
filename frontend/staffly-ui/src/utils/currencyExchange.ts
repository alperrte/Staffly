/** USD/EUR/GBP → TRY (Frankfurter API; başarısız olursa sabit kurlar) */

const FALLBACK_RATES_TO_TRY: Record<string, number> = {
    USD: 44.84,
    EUR: 52.91,
    GBP: 60.67,
};

type FrankfurterLatest = {
    rates?: Record<string, number>;
};

export async function convertForeignToTry(
    amount: number,
    fromCurrency: string
): Promise<{ tryAmount: number; rate: number; usedFallback: boolean }> {
    const from = fromCurrency.trim().toUpperCase();
    if (from === "TRY") {
        return { tryAmount: amount, rate: 1, usedFallback: false };
    }

    try {
        const res = await fetch(
            `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=TRY`
        );
        if (!res.ok) throw new Error("rate fetch failed");
        const data = (await res.json()) as FrankfurterLatest;
        const rate = data.rates?.TRY;
        if (typeof rate !== "number" || !Number.isFinite(rate)) {
            throw new Error("invalid rate");
        }
        return {
            tryAmount: Math.round(amount * rate * 100) / 100,
            rate,
            usedFallback: false,
        };
    } catch {
        const fb = FALLBACK_RATES_TO_TRY[from];
        if (typeof fb !== "number") {
            throw new Error(`TRY karşılığı alınamadı (${from}).`);
        }
        return {
            tryAmount: Math.round(amount * fb * 100) / 100,
            rate: fb,
            usedFallback: true,
        };
    }
}
