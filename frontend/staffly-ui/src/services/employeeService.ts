import API from "../utils/api";

export const getAllEmployees = async () => {
    const response = await API.get("/employees");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getEmployees = async () => {
    const response = await API.get("/employees");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};


export const createEmployee = async (data: any) => {
    const response = await API.post("/employees", data);
    return response.data;
};
//Push
