export type DepartmentPosition = {
    name: string;
    description: string;
};

export type SubDepartment = {
    name: string;
    description: string;
    managerId?: number | null;
    positions: DepartmentPosition[];
};

export type Department = {
    id?: number;
    name: string;
    description: string;
    managerId?: number | null;
    subDepartments: SubDepartment[];
    deleted?: boolean;
};

const BASE_URL = "http://localhost:8083/departments";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
};

export const getDepartments = async (): Promise<Department[]> => {
    const response = await fetch(BASE_URL, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
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
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Departman oluşturulamadı");
    }

    return response.json();
};

export const updateDepartment = async (id: number, data: Department): Promise<Department> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
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
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    if (!response.ok) {
        throw new Error("Departman silinemedi");
    }
};