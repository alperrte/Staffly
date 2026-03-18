import api from "../services/api"; // path doğruysa tamam

export const login = async (email: string, password: string) => {
    const response = await api.post(
        "/auth/login",
        {
            email,
            password
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};