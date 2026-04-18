import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layout/MainLayout";
import CvServicePage from "./pages/cvService/CvServicePage";

import EmployeeListPage from "./pages/employee/EmployeeListPage";
import CreateEmployeePage from "./pages/employee/CreateEmployeePage";

import UserPage from "./pages/userService/UserPage";
import DepartmentsPage from "./pages/department/DepartmentsPage";
import TaskPage from "./pages/task/TaskPage";
import PayrollPage from "./pages/payroll/PayrollPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<LoginPage />} />

                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<div>Dashboard</div>} />

                    <Route path="employees" element={<EmployeeListPage />} />
                    <Route path="employees/create" element={<CreateEmployeePage />} />

                    <Route path="departments" element={<DepartmentsPage />} />

                    <Route path="users" element={<UserPage />} />

                    <Route path="applications" element={<CvServicePage />} />

                    <Route path="tasks" element={<TaskPage />} />

                    <Route path="payroll" element={<PayrollPage />} />

                    <Route path="settings" element={<div>Settings</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;