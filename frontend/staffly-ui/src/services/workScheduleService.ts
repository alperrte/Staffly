import axios from "axios";

const workScheduleApi = axios.create({
    baseURL: "http://localhost:8088/api/v1",
});

const employeeApi = axios.create({
    baseURL: "http://localhost:8082/api/v1",
});

const departmentApi = axios.create({
    baseURL: "http://localhost:8083",
});

const attachToken = (config: any) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

workScheduleApi.interceptors.request.use(attachToken);
employeeApi.interceptors.request.use(attachToken);
departmentApi.interceptors.request.use(attachToken);

/* =======================
   TYPES
======================= */

export type WorkModel =
    | "OFFICE"
    | "HOME_OFFICE"
    | "HYBRID"
    | "REMOTE"
    | "DAY_OFF";

export type OvertimeStatus =
    | "PLANNED"
    | "UPDATED"
    | "CANCELLED"
    | "COMPLETED";

export type EventType =
    | "MEETING"
    | "TRAINING"
    | "INTERVIEW"
    | "COMPANY_EVENT"
    | "OTHER";

export type CalendarEventStatus =
    | "ACTIVE"
    | "CANCELLED";

export type ParticipantStatus =
    | "INVITED"
    | "ACCEPTED"
    | "DECLINED";

export interface EmployeeResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status?: string;
    departmentId?: number;
    positionName?: string;
}

export interface DepartmentResponse {
    id: number;
    name: string;
    description?: string;
    managerId?: number | null;
    deleted?: boolean;
}

export interface WorkScheduleResponse {
    id: number;
    employeeId: number;
    departmentId: number | null;
    workDate: string;
    workModel: WorkModel;
    note: string | null;
}

export interface CreateWorkScheduleRequest {
    employeeId: number;
    departmentId?: number | null;
    workDate: string;
    workModel: WorkModel;
    note?: string;
}

export interface CreateBulkWorkScheduleRequest {
    departmentId: number;
    startDate: string;
    endDate: string;
    workModel: WorkModel;
}

export interface OvertimeResponse {
    id: number;
    employeeId: number;
    departmentId: number | null;
    overtimeDate: string;
    startTime: string;
    endTime: string;
    reason: string | null;
    status: OvertimeStatus;
}

export interface CreateOvertimeRequest {
    employeeId: number;
    departmentId?: number | null;
    overtimeDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
}

export interface CreateBulkOvertimeRequest {
    departmentId?: number | null;
    employeeIds?: number[];
    overtimeDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
}

export interface UpdateOvertimeRequest {
    employeeId: number;
    departmentId?: number | null;
    overtimeDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
}

export interface ParticipantResponse {
    employeeId: number;
    status: ParticipantStatus;
}

export interface CalendarEventResponse {
    id: number;
    title: string;
    description: string | null;
    eventType: EventType;
    startDateTime: string;
    endDateTime: string;
    location: string | null;
    onlineMeetingUrl: string | null;
    departmentId: number | null;
    status: CalendarEventStatus;
    participants: ParticipantResponse[];
}

export interface CreateCalendarEventRequest {
    title: string;
    description?: string;
    eventType: EventType;
    startDateTime: string;
    endDateTime: string;
    location?: string;
    onlineMeetingUrl?: string;
    departmentId?: number | null;
    participantIds?: number[];
}

export interface UpdateCalendarEventRequest {
    title: string;
    description?: string;
    eventType: EventType;
    startDateTime: string;
    endDateTime: string;
    location?: string;
    onlineMeetingUrl?: string;
    departmentId?: number | null;
}

export interface CreateCompanyHolidayRequest {
    name: string;
    holidayDate: string;
    description?: string;
}

export interface CompanyHolidayResponse {
    id: number;
    name: string;
    holidayDate: string;
    description: string | null;
    active: boolean;
}

export interface DepartmentWorkScheduleResponse {
    id: number;
    departmentId: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    active: boolean;
}

export interface CreateDepartmentWorkScheduleRequest {
    departmentId: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
}

/* =======================
   EMPLOYEE / DEPARTMENT
======================= */

export const getEmployees = async (): Promise<EmployeeResponse[]> => {
    const response = await employeeApi.get("/employees");
    const payload = response.data;

    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getDepartments = async (): Promise<DepartmentResponse[]> => {
    const response = await departmentApi.get("/departments");
    const payload = response.data;

    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

/* =======================
   WORK SCHEDULE
======================= */

export const createWorkSchedule = async (
    data: CreateWorkScheduleRequest
): Promise<WorkScheduleResponse> => {
    const response = await workScheduleApi.post("/work-schedules", data);
    return response.data;
};

export const createBulkWorkSchedule = async (
    data: CreateBulkWorkScheduleRequest
): Promise<WorkScheduleResponse[]> => {
    const response = await workScheduleApi.post("/work-schedules/bulk", data);
    return response.data;
};

export const getEmployeeSchedule = async (
    employeeId: number,
    startDate: string,
    endDate: string
): Promise<WorkScheduleResponse[]> => {
    const response = await workScheduleApi.get(
        `/work-schedules/employee/${employeeId}`,
        {
            params: { startDate, endDate },
        }
    );

    return response.data;
};

export const getEmployeeMonthlySchedule = async (
    employeeId: number,
    startDate: string,
    endDate: string
): Promise<WorkScheduleResponse[]> => {
    const response = await workScheduleApi.get(
        `/work-schedules/employee/${employeeId}/monthly`,
        {
            params: { startDate, endDate },
        }
    );

    return response.data;
};

export const getDepartmentSchedule = async (
    departmentId: number,
    startDate: string,
    endDate: string
): Promise<WorkScheduleResponse[]> => {
    const response = await workScheduleApi.get(
        `/work-schedules/department/${departmentId}`,
        {
            params: { startDate, endDate },
        }
    );

    return response.data;
};

export const updateWorkSchedule = async (
    id: number,
    data: CreateWorkScheduleRequest
): Promise<WorkScheduleResponse> => {
    const response = await workScheduleApi.put(`/work-schedules/${id}`, data);
    return response.data;
};

export const cancelWorkSchedule = async (
    id: number
): Promise<WorkScheduleResponse> => {
    const response = await workScheduleApi.patch(`/work-schedules/${id}/cancel`);
    return response.data;
};

/* =======================
   OVERTIME
======================= */

export const createOvertime = async (
    data: CreateOvertimeRequest
): Promise<OvertimeResponse> => {
    const response = await workScheduleApi.post("/overtimes", data);
    return response.data;
};

export const createBulkOvertime = async (
    data: CreateBulkOvertimeRequest
): Promise<OvertimeResponse[]> => {
    const response = await workScheduleApi.post("/overtimes/bulk", data);
    return response.data;
};

export const getEmployeeOvertimes = async (
    employeeId: number,
    startDate: string,
    endDate: string
): Promise<OvertimeResponse[]> => {
    const response = await workScheduleApi.get(
        `/overtimes/employee/${employeeId}`,
        {
            params: { startDate, endDate },
        }
    );

    return response.data;
};

export const getDepartmentOvertimes = async (
    departmentId: number,
    startDate: string,
    endDate: string
): Promise<OvertimeResponse[]> => {
    const response = await workScheduleApi.get(
        `/overtimes/department/${departmentId}`,
        {
            params: { startDate, endDate },
        }
    );

    return response.data;
};

export const updateOvertime = async (
    id: number,
    data: UpdateOvertimeRequest
): Promise<OvertimeResponse> => {
    const response = await workScheduleApi.put(`/overtimes/${id}`, data);
    return response.data;
};

export const cancelOvertime = async (
    id: number
): Promise<OvertimeResponse> => {
    const response = await workScheduleApi.patch(`/overtimes/${id}/cancel`);
    return response.data;
};

/* =======================
   CALENDAR EVENTS
======================= */

export const createCalendarEvent = async (
    data: CreateCalendarEventRequest
): Promise<CalendarEventResponse> => {
    const response = await workScheduleApi.post("/calendar-events", data);
    return response.data;
};

export const getCalendarEvents = async (
    startDateTime: string,
    endDateTime: string
): Promise<CalendarEventResponse[]> => {
    const response = await workScheduleApi.get("/calendar-events", {
        params: { startDateTime, endDateTime },
    });

    return response.data;
};

export const getDepartmentEvents = async (
    departmentId: number,
    startDateTime: string,
    endDateTime: string
): Promise<CalendarEventResponse[]> => {
    const response = await workScheduleApi.get(
        `/calendar-events/department/${departmentId}`,
        {
            params: { startDateTime, endDateTime },
        }
    );

    return response.data;
};

export const updateCalendarEvent = async (
    id: number,
    data: UpdateCalendarEventRequest
): Promise<CalendarEventResponse> => {
    const response = await workScheduleApi.put(`/calendar-events/${id}`, data);
    return response.data;
};

export const cancelCalendarEvent = async (
    id: number
): Promise<CalendarEventResponse> => {
    const response = await workScheduleApi.patch(`/calendar-events/${id}/cancel`);
    return response.data;
};

export const addParticipants = async (
    eventId: number,
    employeeIds: number[]
): Promise<CalendarEventResponse> => {
    const response = await workScheduleApi.post(
        `/calendar-events/${eventId}/participants`,
        { employeeIds }
    );

    return response.data;
};

export const removeParticipant = async (
    eventId: number,
    employeeId: number
): Promise<void> => {
    await workScheduleApi.delete(
        `/calendar-events/${eventId}/participants/${employeeId}`
    );
};

/* =======================
   COMPANY HOLIDAYS
======================= */

export const createCompanyHoliday = async (
    data: CreateCompanyHolidayRequest
): Promise<CompanyHolidayResponse> => {
    const response = await workScheduleApi.post("/company-holidays", data);
    return response.data;
};

export const getCompanyHolidays = async (): Promise<CompanyHolidayResponse[]> => {
    const response = await workScheduleApi.get("/company-holidays");
    return response.data;
};

export const createDepartmentWorkSchedule = async (
    data: CreateDepartmentWorkScheduleRequest
): Promise<DepartmentWorkScheduleResponse> => {
    const response = await workScheduleApi.post(
        "/department-work-schedules",
        data
    );
    return response.data;
};

export const getDepartmentWorkSchedules = async (): Promise<
    DepartmentWorkScheduleResponse[]
> => {
    const response = await workScheduleApi.get("/department-work-schedules");
    return response.data;
};

export const updateDepartmentWorkSchedule = async (
    id: number,
    data: CreateDepartmentWorkScheduleRequest
): Promise<DepartmentWorkScheduleResponse> => {
    const response = await workScheduleApi.put(
        `/department-work-schedules/${id}`,
        data
    );
    return response.data;
};

export const deactivateDepartmentWorkSchedule = async (
    id: number
): Promise<void> => {
    await workScheduleApi.patch(`/department-work-schedules/${id}/deactivate`);
};

export const activateDepartmentWorkSchedule = async (
    id: number
): Promise<void> => {
    await workScheduleApi.patch(`/department-work-schedules/${id}/activate`);
};