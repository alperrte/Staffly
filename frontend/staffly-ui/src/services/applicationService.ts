import axios from "axios";

const cvApi = axios.create({
    baseURL: "http://localhost:8085",
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

export const getApplicationCv = async (id: number, token?: string | null) => {
    const response = await cvApi.get(`/applications/${id}/cv`, {
        responseType: "blob",
        headers: token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : undefined,
    });

    return response.data;
};