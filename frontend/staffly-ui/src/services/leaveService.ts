import axios from "axios";

const leaveApi = axios.create({
    baseURL: "http://localhost:8089/api",
});

leaveApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export type Leave = {
    id: number;
    employeeId: number;
    leaveTypeName: string;
    startDatetime: string;
    endDatetime: string;
    totalDays?: number | null;
    totalHours?: number | null;
    status: string;
    reason?: string | null;
    rejectionReason?: string | null;
    employeeFirstName?: string | null;
    employeeLastName?: string | null;
    employeeFullName?: string | null;
    createdAt?: string | null;
};

export type LeaveType = {
    id: number;
    name: string;
    description?: string | null;
    isHourly?: boolean;
};

export type LeaveBalance = {
    employeeId: number;
    leaveTypeId: number;
    leaveTypeName: string;
    quotaDays?: number | null;
    remainingDays?: number | null;
    remainingHours?: number | null;
};

type CreateLeaveRequest = {
    employeeId: number;
    leaveTypeId: number;
    startDatetime: string;
    endDatetime: string;
    reason: string;
};

export type LeaveApprovalPayload = {
    leaveRequestId: number;
    managerId: number;
    action: "APPROVED" | "REJECTED";
    comment: string;
};

export const getEmployeeLeaves = async (employeeId: number): Promise<Leave[]> => {
    const response = await leaveApi.get(`/leaves/employee/${employeeId}`);
    return response.data;
};

export const getAllLeaves = async (): Promise<Leave[]> => {
    const response = await leaveApi.get("/leaves");
    return response.data;
};

export const getAnnualLeaveBalance = async (employeeId: number): Promise<LeaveBalance> => {
    const response = await leaveApi.get(`/leaves/employee/${employeeId}/annual-balance`);
    return response.data;
};

export const updateAnnualLeaveQuota = async (employeeId: number, quotaDays: number): Promise<LeaveBalance> => {
    const response = await leaveApi.put(`/leaves/employee/${employeeId}/annual-quota`, { quotaDays });
    return response.data;
};

export const createLeave = async (data: CreateLeaveRequest): Promise<Leave> => {
    const response = await leaveApi.post("/leaves", data);
    return response.data;
};

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
    const response = await leaveApi.get("/leave-types");
    return response.data;
};

export const reviewLeave = async (data: LeaveApprovalPayload) => {
    const response = await leaveApi.post("/leaves/approve", data);
    return response.data;
};
