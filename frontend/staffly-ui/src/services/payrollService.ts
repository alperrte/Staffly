import axios from "axios";

const payrollApi = axios.create({
    baseURL: "http://localhost:8086/api/v1",
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
    id?: number;
    employeeId: number;
    month: number;
    year: number;
    baseSalary: string | number;
    totalBonus: string | number;
    totalDeduction: string | number;
    netSalary: string | number;
    status: string;
    createdAt?: string;
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
    currentMonthTotalBonus: string | number | null;
    currentMonthTotalDeduction: string | number | null;
    currentMonthApprovedAdvance: string | number | null;
    currentProjectedNetSalary: string | number | null;
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

export type BonusRecord = {
    id: number;
    employeeId: number;
    amount: number | string;
    description?: string | null;
    createdAt?: string;
};

export type DeductionRecord = {
    id: number;
    employeeId: number;
    amount: number | string;
    description?: string | null;
    createdAt?: string;
};

export type AdvanceRecord = {
    id: number;
    employeeId: number;
    amount: number | string;
    requestDate?: string;
    approved?: boolean;
    rejectionReason?: string | null;
    reviewedAt?: string | null;
    createdAt?: string;
};

export type RejectAdvancePayload = {
    reason: string;
};

export const getEmployeePayrollOverview = async (employeeId: number) => {
    const res = await payrollApi.get<EmployeePayrollOverview>(
        `/payrolls/employees/${employeeId}/overview`
    );
    return res.data;
};

export const getMyPayrollOverview = async () => {
    const res = await payrollApi.get<EmployeePayrollOverview>("/payrolls/me/overview");
    return res.data;
};

export const getMyBonuses = async () => {
    const res = await payrollApi.get<BonusRecord[]>("/payrolls/me/bonuses");
    return Array.isArray(res.data) ? res.data : [];
};

export const getMyDeductions = async () => {
    const res = await payrollApi.get<DeductionRecord[]>("/payrolls/me/deductions");
    return Array.isArray(res.data) ? res.data : [];
};

export const getMyAdvances = async () => {
    const res = await payrollApi.get<AdvanceRecord[]>("/payrolls/me/advances");
    return Array.isArray(res.data) ? res.data : [];
};

export const getMyPayrolls = async () => {
    const res = await payrollApi.get<PayrollResponse[]>("/payrolls/me/payrolls");
    return Array.isArray(res.data) ? res.data : [];
};

export const getEmployeeBonuses = async (employeeId: number) => {
    const res = await payrollApi.get<BonusRecord[]>(`/payrolls/employees/${employeeId}/bonuses`);
    return Array.isArray(res.data) ? res.data : [];
};

export const getEmployeeDeductions = async (employeeId: number) => {
    const res = await payrollApi.get<DeductionRecord[]>(
        `/payrolls/employees/${employeeId}/deductions`
    );
    return Array.isArray(res.data) ? res.data : [];
};

export const getEmployeeAdvances = async (employeeId: number) => {
    const res = await payrollApi.get<AdvanceRecord[]>(`/payrolls/employees/${employeeId}/advances`);
    return Array.isArray(res.data) ? res.data : [];
};

export const getEmployeePayrolls = async (employeeId: number) => {
    const res = await payrollApi.get<PayrollResponse[]>(`/payrolls/employees/${employeeId}/payrolls`);
    return Array.isArray(res.data) ? res.data : [];
};

export const getEmployeeSalaries = async (employeeId: number) => {
    const res = await payrollApi.get<SalaryRecord[]>(`/payrolls/employees/${employeeId}/salaries`);
    return Array.isArray(res.data) ? res.data : [];
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

export const rejectAdvance = async (advanceId: number, payload: RejectAdvancePayload) => {
    const res = await payrollApi.put(`/payrolls/advance/${advanceId}/reject`, payload);
    return res.data;
};

export const getPendingAdvanceRequests = async () => {
    const res = await payrollApi.get<AdvanceRecord[]>("/payrolls/advances/pending");
    return Array.isArray(res.data) ? res.data : [];
};

export const generatePayroll = async (payload: PayrollGeneratePayload) => {
    const res = await payrollApi.post<PayrollResponse>("/payrolls/generate", payload);
    return res.data;
};
