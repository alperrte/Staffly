import axios from "axios";

const leaveApi = axios.create({
    baseURL: "http://localhost:8089/api", //
});

leaveApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 🔹 TYPES
type CreateLeaveRequest = {
    employeeId: number;
    leaveTypeId: number;
    startDatetime: string;
    endDatetime: string;
    reason: string;
};

// 🔹 GET all leaves
export const getAllLeaves = async (employeeId: number) => {
    const response = await leaveApi.get(`/leaves/employee/${employeeId}`);
    return response.data;
};

// 🔹 CREATE leave
export const createLeave = async (data: CreateLeaveRequest) => {
    const response = await leaveApi.post("/leaves", data);
    return response.data;
};

// 🔹 GET leave types
export const getLeaveTypes = async () => {
    const response = await leaveApi.get("/leave-types");
    return response.data;
};

export const approveLeave = async (data: any) => {
    return await leaveApi.post("/leaves/approve", data);
};

export const rejectLeave = async (data: any) => {
    return await leaveApi.post("/leaves/approve", data);
};

