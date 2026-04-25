import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    const publicEndpoints = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
    );

    if (token && !isPublic) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;