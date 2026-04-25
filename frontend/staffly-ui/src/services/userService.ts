import api from "./api";
import axios from "axios";

export interface Role {
    name: string;
    description?: string;
}

export interface User {
    email: string;
    active: boolean;
    roles: Role[];
}

export type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    departmentId?: number;
    positionName?: string;
};

const employeeApi = axios.create({
    baseURL: "http://localhost:8082",
});

employeeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data;
};

export const createUser = async (data: {
    email: string;
    password: string;
    employeeId?: number;
}) => {
    const response = await api.post("/auth/register", data);
    return response.data;
};

export const getEmployeesForUserCreation = async (): Promise<Employee[]> => {
    const response = await employeeApi.get("/employees");
    return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get("/roles");
    return response.data;
};

export const setUserActive = async (email: string, active: boolean): Promise<User> => {
    const response = await api.patch(
        `/users/${encodeURIComponent(email)}/active`,
        { active }
    );
    return response.data;
};

export const setUserRoles = async (email: string, roles: string[]): Promise<User> => {
    const response = await api.patch(
        `/users/${encodeURIComponent(email)}/roles`,
        { roles }
    );
    return response.data;
};

export const deleteUser = async (email: string): Promise<void> => {
    await api.delete(`/users/${encodeURIComponent(email)}`);
};