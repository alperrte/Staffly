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
import JobPostingsPage from "./pages/jobPostings/JobPostingPage";
import LeaveServicePage from "./pages/leaveService/LeaveServicePage";

import WorkScheduleManagementPage from "./pages/workSchedule/WorkScheduleManagementPage";
import MeetingPlanningPage from "./pages/workSchedule/MeetingPlanningPage";
import MySchedulePage from "./pages/workSchedule/MySchedulePage";
import MyTasksPage from "./pages/task/MyTasksPage";
import CreateTaskPage from "./pages/task/CreateTaskPage";

import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<LoginPage />} />

                <Route path="/set-password" element={<SetPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<div>Dashboard</div>} />

                    <Route path="employees" element={<EmployeeListPage />} />
                    <Route path="employees/create" element={<CreateEmployeePage />} />

                    <Route path="departments" element={<DepartmentsPage />} />
                    <Route path="users" element={<UserPage />} />
                    <Route path="applications" element={<CvServicePage />} />
                    <Route path="job-postings" element={<JobPostingsPage />} />

                    <Route path="tasks" element={<TaskPage />} />
                    <Route path="tasks/create" element={<CreateTaskPage />} />
                    <Route path="tasks/mytasks" element={<MyTasksPage />} />

                    <Route path="payroll" element={<PayrollPage />} />
                    <Route path="leaveService" element={<LeaveServicePage />} />

                    <Route path="work-schedules" element={<WorkScheduleManagementPage />} />
                    <Route path="meetings" element={<MeetingPlanningPage />} />
                    <Route path="my-schedule" element={<MySchedulePage />} />

                    <Route path="settings" element={<div>Settings</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;