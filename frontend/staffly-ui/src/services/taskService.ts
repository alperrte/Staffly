import axios from "axios";

const TASK_API = axios.create({
  baseURL: "http://localhost:8084",
});

TASK_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMyTasks = () => {
  return TASK_API.get("/tasks/my-tasks");
};

export const createTask = (data: any) => {
  return TASK_API.post("/tasks", data);
};

export const assignTask = (taskId: number, employeeId: number) => {
  return TASK_API.post(`/tasks/${taskId}/assign`, { employeeId });
};

export const updateStatus = (taskId: number, statusId: number) => {
  return TASK_API.put(`/tasks/${taskId}/status`, { statusId });
};

export const getComments = (taskId: number) => {
  return TASK_API.get(`/tasks/${taskId}/comments`);
};

export const addComment = (taskId: number, comment: string) => {
  return TASK_API.post(`/tasks/${taskId}/comments`, { comment });
};