import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import {
    ROLE_DEPARTMENT_MANAGER,
    ROLE_EMPLOYEE,
    ROLE_HR_MANAGER,
    ROLE_MANAGER,
    ROLE_SYSTEM_ADMIN,
    ROLE_ACCOUNTING,
} from "./utils/auth";

import EmployeeListPage from "./pages/employee/EmployeeListPage";
import CreateEmployeePage from "./pages/employee/CreateEmployeePage";
import UserPage from "./pages/userService/UserPage";
import DepartmentsPage from "./pages/department/DepartmentsPage";
import TaskPage from "./pages/task/TaskPage";
import PayrollRedirectPage from "./pages/payroll/PayrollRedirectPage";
import EmployeeSalaryTrackingPage from "./pages/payroll/EmployeeSalaryTrackingPage";
import AdvanceRequestsPage from "./pages/payroll/AdvanceRequestsPage";
import SalaryAssignmentPage from "./pages/payroll/SalaryAssignmentPage";
import JobPostingsPage from "./pages/jobPostings/JobPostingPage";
import LeaveServicePage from "./pages/leaveService/LeaveServicePage";
import ProfilePage from "./pages/profile/ProfilePage";

import WorkScheduleManagementPage from "./pages/workSchedule/WorkScheduleManagementPage";
import MeetingPlanningPage from "./pages/workSchedule/MeetingPlanningPage";
import MySchedulePage from "./pages/workSchedule/MySchedulePage";
import MyTasksPage from "./pages/task/MyTasksPage";
import CreateTaskPage from "./pages/task/CreateTaskPage";
import TransportPage from "./pages/transport/TransportPage";
import MyTicketsPage from "./pages/support/MyTicketsPage";
import AllTicketsPage from "./pages/support/AllTicketsPage";

import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import DepartmentManagementPage from "./pages/department/DepartmentManagementPage";

import ApplicationPage from "./pages/application/ApplicationPage";

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

                    <Route
                        path="employees"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER]}>
                                <EmployeeListPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="employees/create"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]}>
                                <CreateEmployeePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="departments"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_DEPARTMENT_MANAGER]}>
                                <DepartmentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="departments/manage"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]}>
                                <DepartmentManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN]}>
                                <UserPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="applications"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]}>
                                <ApplicationPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="job-postings"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]}>
                                <JobPostingsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="tasks"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <TaskPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="tasks/create"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER]}>
                                <CreateTaskPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="tasks/mytasks"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <MyTasksPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="payroll"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <PayrollRedirectPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payroll/salary-tracking"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_EMPLOYEE]}>
                                <EmployeeSalaryTrackingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payroll/advance-requests"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING]}>
                                <AdvanceRequestsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payroll/salary-assignment"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING]}>
                                <SalaryAssignmentPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="leaveService"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <LeaveServicePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="work-schedules"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_DEPARTMENT_MANAGER]}>
                                <WorkScheduleManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="meetings"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER]}>
                                <MeetingPlanningPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="my-schedule"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_DEPARTMENT_MANAGER, ROLE_EMPLOYEE]}>
                                <MySchedulePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="transport"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <TransportPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="support"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <MyTicketsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="support/all"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE]}>
                                <AllTicketsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="applications"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]}>
                                <ApplicationPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="profile"
                        element={
                            <ProtectedRoute allowedRoles={[ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_MANAGER, ROLE_EMPLOYEE, ROLE_DEPARTMENT_MANAGER]}>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="settings" element={<ProtectedRoute><div>Settings</div></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
