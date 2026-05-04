import API from "../services/api";

// 🔥 BASE PATH
const BASE = "http://localhost:8084";

// 🔥 MY TASKS (JWT)
export const getMyTasks = async () => {
  const res = await API.get(`${BASE}/tasks/my-tasks`);
  return res.data;
};

// 🔥 ALL TASKS (admin / tasks page)
export const getAllTasks = async () => {
  const res = await API.get(`${BASE}/tasks`);
  return res.data;
};

// 🔥 EMPLOYEE TASKS (admin UI vs)
export const getTasksByEmployee = async (employeeId: number) => {
  const res = await API.get(`${BASE}/tasks/employee/${employeeId}`);
  return res.data;
};

// 🔥 CREATE
export const createTask = async (data: any) => {
  const res = await API.post(`${BASE}/tasks`, data);
  return res.data;
};

// 🔥 ASSIGN
export const assignTask = async (taskId: number, employeeId: number) => {
  await API.post(`${BASE}/tasks/${taskId}/assign`, { employeeId });
};

// 🔥 STATUS
export const updateStatus = async (taskId: number, statusId: number) => {
  await API.put(`${BASE}/tasks/${taskId}/status`, { statusId });
};

// 🔥 COMMENTS
export const getComments = async (taskId: number) => {
  const res = await API.get(`${BASE}/tasks/${taskId}/comments`);
  return res.data;
};

export const addComment = async (taskId: number, comment: string) => {
  await API.post(`${BASE}/tasks/${taskId}/comments`, { comment });
};