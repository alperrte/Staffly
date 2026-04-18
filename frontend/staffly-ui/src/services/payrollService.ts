import axios from "axios";

/**
 * Axios path'leri `/payrolls/...` ile başlar; Spring tarafı `/api/v1/payrolls` altında.
 * Sık hata: .env'de sadece `http://localhost:8086` yazılınca istek `/payrolls`'a gider (404).
 */
function normalizePayrollBase(raw: string): string {
    const s = raw.trim().replace(/\/+$/, "");
    if (!s || s === "/payroll-api") {
        return s;
    }
    if (/^https?:\/\//i.test(s)) {
        if (/\/api\/v1$/i.test(s)) {
            return s;
        }
        return `${s}/api/v1`;
    }
    return s;
}

function payrollBaseUrl(): string {
    const explicit = import.meta.env.VITE_PAYROLL_API_URL as string | undefined;
    if (explicit && explicit.trim().length > 0) {
        return normalizePayrollBase(explicit);
    }
    if (import.meta.env.DEV) {
        return "/payroll-api";
    }
    return "http://127.0.0.1:8086/api/v1";
}

const PAYROLL_BASE = payrollBaseUrl();

const payrollApi = axios.create({
    baseURL: PAYROLL_BASE,
});

payrollApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export type SalaryPayload = {
    employeeId: number;
    baseSalary: number | string;
    currency?: string;
};

export type BonusPayload = {
    employeeId: number;
    amount: number | string;
    description?: string;
};

export type DeductionPayload = {
    employeeId: number;
    amount: number | string;
    description?: string;
};

export type AdvancePayload = {
    employeeId: number;
    amount: number | string;
    requestDate: string;
};

export type PayrollGeneratePayload = {
    employeeId: number;
    month: number;
    year: number;
};

export type PayrollResponse = {
    employeeId: number;
    month: number;
    year: number;
    baseSalary: string | number;
    totalBonus: string | number;
    totalDeduction: string | number;
    netSalary: string | number;
    status: string;
};

export type SalaryRecord = {
    id: number;
    employeeId: number;
    baseSalary: string | number;
    currency?: string;
    effectiveDate?: string;
    createdAt?: string;
};

export type EmployeePayrollOverview = {
    currentSalary: SalaryRecord | null;
    lastPayrollMonth: number | null;
    lastPayrollYear: number | null;
    lastNetSalary: string | number | null;
    lastBaseSalary: string | number | null;
    lastTotalBonus: string | number | null;
    lastTotalDeduction: string | number | null;
    lastPayrollStatus: string | null;
    payrollRecordCount: number;
    bonusEntryCount: number;
    deductionEntryCount: number;
    pendingAdvanceCount: number;
    approvedAdvanceCount: number;
};

export const getEmployeePayrollOverview = async (employeeId: number) => {
    const res = await payrollApi.get<EmployeePayrollOverview>(
        `/payrolls/employees/${employeeId}/overview`
    );
    return res.data;
};

export const createSalary = async (payload: SalaryPayload) => {
    const res = await payrollApi.post<SalaryRecord>("/payrolls/salaries", payload);
    return res.data;
};

export const addBonus = async (payload: BonusPayload) => {
    const res = await payrollApi.post("/payrolls/bonus", payload);
    return res.data;
};

export const addDeduction = async (payload: DeductionPayload) => {
    const res = await payrollApi.post("/payrolls/deduction", payload);
    return res.data;
};

export const requestAdvance = async (payload: AdvancePayload) => {
    const res = await payrollApi.post("/payrolls/advance", payload);
    return res.data;
};

export const approveAdvance = async (advanceId: number) => {
    const res = await payrollApi.put(`/payrolls/advance/${advanceId}/approve`);
    return res.data;
};

export const generatePayroll = async (payload: PayrollGeneratePayload) => {
    const res = await payrollApi.post<PayrollResponse>("/payrolls/generate", payload);
    return res.data;
};
