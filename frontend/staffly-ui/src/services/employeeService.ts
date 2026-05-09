import axios from "axios";

const employeeApi = axios.create({
    baseURL: "http://localhost:8082/api/v1",
});

const departmentApi = axios.create({
    baseURL: "http://localhost:8083",
});

employeeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

departmentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export type CreateEmployeeRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    departmentId: number;
    positionId: number;
};

export const getAllEmployees = async () => {
    const response = await employeeApi.get("/employees");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getEmployees = async () => {
    const response = await employeeApi.get("/employees");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getEmployeeById = async (id: number) => {
    const response = await employeeApi.get(`/employees/${id}`);
    return response.data;
};

export const createEmployee = async (data: CreateEmployeeRequest) => {
    const response = await employeeApi.post("/employees", data);
    return response.data;
};

export const updateEmployee = async (id: number, data: UpdateEmployeeRequest) => {
    const response = await employeeApi.put(`/employees/${id}`, data);
    return response.data;
};

export const deleteEmployee = async (id: number) => {
    const response = await employeeApi.delete(`/employees/${id}`);
    return response.data;
};

export const getDepartments = async (): Promise<Department[]> => {
    const response = await departmentApi.get("/departments");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getSubDepartmentsByDepartmentId = async (
    departmentId: number
): Promise<SubDepartment[]> => {
    const response = await departmentApi.get(`/departments/${departmentId}/sub-departments`);
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getPositionsBySubDepartmentId = async (
    subDepartmentId: number
): Promise<DepartmentPosition[]> => {
    const response = await departmentApi.get(
        `/departments/sub-departments/${subDepartmentId}/positions`
    );

    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getMyProfile = async () => {
    const response = await employeeApi.get("/employees/me");

    return response.data;
};

export const updateMyProfile = async (data: {
    phone?: string;
    email?: string;
}) => {

    const response = await employeeApi.patch(
        "/employees/me",
        data
    );

    return response.data;
};

export const uploadProfileImage = async (
    file: File
) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await employeeApi.post(
        "/employees/me/profile-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};