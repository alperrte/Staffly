import type { Department } from "../types/departmentTypes";

const BASE_URL = "http://localhost:8083/departments";

const getToken = () => {
    return localStorage.getItem("token");
};

const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
    };
};

export const getDepartments = async (): Promise<Department[]> => {
    const response = await fetch(BASE_URL, {
        headers: {
            Authorization: "Bearer " + getToken(),
        },
    });

    if (!response.ok) {
        throw new Error("Departmanlar alınamadı");
    }

    return response.json();
};

export const createDepartment = async (data: Department): Promise<Department> => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Departman oluşturulamadı");
    }

    return response.json();
};

export const updateDepartment = async (
    id: number,
    data: Department
): Promise<Department> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Departman güncellenemedi");
    }

    return response.json();
};

export const deleteDepartment = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + getToken(),
        },
    });

    if (!response.ok) {
        throw new Error("Departman silinemedi");
    }
};