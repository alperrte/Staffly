import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    const publicEndpoints = [
        "/auth/login",
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
        // Only treat 401 (unauthenticated) as a signal to clear tokens and redirect.
        // 403 (forbidden) means the token is valid but access is denied — do not log out.
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;
