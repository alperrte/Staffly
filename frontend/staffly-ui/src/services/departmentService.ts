type Department = {
    name: string;
    description: string;
};

const BASE_URL = "http://localhost:8083/departments";



export const getDepartments = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(BASE_URL, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!response.ok) {
        throw new Error("API error");
    }

    return response.json();
};

export const createDepartment = async (data: Department) => {
    const token = localStorage.getItem("token");
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Create failed");
    }

    return response.json();
};