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