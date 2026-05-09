export type Application = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;

    jobPostingId?: number;
    jobPostingTitle?: string | null;

    departmentId: number;
    subDepartmentId: number;
    positionId: number;

    departmentName: string;
    subDepartmentName: string;
    positionName: string;

    status: string;
    appliedAt?: string;
    reviewedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    countryCode?: string;
};

export type ApplicationTabType = "PENDING" | "ACCEPTED" | "REJECTED";

export type ApplicationSortField =
    | "firstName"
    | "lastName"
    | "departmentName"
    | "positionName";

export type SortDirection = "asc" | "desc";

export type ApplicationActionType = "ACCEPTED" | "REJECTED" | null;

export type Position = {
    id: number;
    name?: string;
    positionName?: string;
    subDepartmentId?: number;
};

export type JobPosting = {
    id: number;
    title: string;
    description: string;
    departmentName: string;
    subDepartmentName: string;
    positionName: string;
    positionId: number;
    experienceLevel?: string;
    employmentType?: string;
    workModel?: string;
    location?: string;
    requirements?: string;
    responsibilities?: string;
    benefits?: string;
    teamInfo?: string;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    applicationDeadline?: string;
    createdAt?: string;
    closedAt?: string;
};

export type JobPostingStatusFilter = "ACTIVE" | "DRAFT" | "CLOSED";