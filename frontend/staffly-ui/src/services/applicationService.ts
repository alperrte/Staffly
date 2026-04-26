import axios from "axios";

const cvApi = axios.create({
    baseURL: "http://localhost:8085",
});

const departmentApi = axios.create({
    baseURL: "http://localhost:8083",
});

cvApi.interceptors.request.use((config) => {
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

export const createApplication = async (formData: FormData) => {
    const response = await cvApi.post("/applications", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getApplications = async () => {
    const response = await cvApi.get("/applications");
    return response.data;
};

export const updateApplicationStatus = async (
    id: number,
    status: "ACCEPTED" | "REJECTED"
) => {
    const response = await cvApi.patch(`/applications/${id}/status?status=${status}`);
    return response.data;
};

export const getApplicationCv = async (id: number) => {
    const response = await cvApi.get(`/applications/${id}/cv`, {
        responseType: "blob",
    });

    return response.data;
};

export const getAllPositions = async () => {
    const response = await departmentApi.get("/departments/positions");
    return response.data;
};


