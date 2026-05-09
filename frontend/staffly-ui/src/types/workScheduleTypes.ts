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

export type CalendarEventStatus = "ACTIVE" | "CANCELLED";

export type ParticipantStatus = "INVITED" | "ACCEPTED" | "DECLINED";

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

export interface ShiftResponse {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    active?: boolean;
}

export interface WorkScheduleResponse {
    id: number;
    employeeId: number;
    departmentId: number | null;
    workDate: string;
    workModel: WorkModel;
    note: string | null;
    shift?: ShiftResponse | null;
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