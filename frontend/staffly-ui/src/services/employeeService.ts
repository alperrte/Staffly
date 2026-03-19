import API from "../utils/api";

export const getAllEmployees = async () => {
    const response = await API.get("/employees");
    return response.data;
};

export const createEmployee = async (data: any) => {
    const response = await API.post("/employees", data);
    return response.data;
};