export type CreateEmployeeRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    medeniDurum?: string;
    tc?: string;
    departmentId: number;
    positionId: number;
    profileFile?: File | null;
};

export type EmployeeApiResponse = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    hireDate?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    medeniDurum?: string | null;
    tc?: string | null;
    departmentId?: number | null;
    departmentName?: string | null;
    subDepartmentId?: number | null;
    subDepartmentName?: string | null;
    positionId?: number | null;
    positionName?: string | null;
    titleName?: string | null;
    managerId?: number | null;
    managerName?: string | null;
    profileImage?: string | null;
    profilePhotoUrl?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    workType?: string | null;
    salary?: number | string | null;
    address?: string | null;
    [key: string]: unknown;
};

export const UNSPECIFIED_LABEL = "Belirtilmemiş";

export type NormalizedEmployee = {
    id: number;
    basicInfo: {
        firstName: string;
        lastName: string;
        fullName: string;
        employeeCode: string;
        status: string;
        statusLabel: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        address: string;
    };
    organizationInfo: {
        departmentId: number | null;
        departmentName: string;
        subDepartmentId: number | null;
        subDepartmentName: string;
        positionId: number | null;
        positionName: string;
        titleName: string;
        managerId: number | null;
        managerName: string;
        hierarchyLabel: string;
    };
    workInfo: {
        hireDate: string;
        workType: string;
        salary: string;
        gender: string;
        medeniDurum: string;
        birthDate: string;
        tc: string;
    };
    mediaInfo: {
        profileImage: string | null;
        profilePhotoUrl: string | null;
        imageVersion: string;
        initials: string;
    };
    raw: EmployeeApiResponse;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    hireDate: string | null;
    phone: string | null;
    birthDate: string | null;
    gender: string | null;
    medeniDurum: string | null;
    tc: string | null;
    departmentId: number | null;
    departmentName: string | null;
    subDepartmentId: number | null;
    subDepartmentName: string | null;
    positionId: number | null;
    positionName: string | null;
    titleName: string | null;
    managerId: number | null;
    managerName: string | null;
    profileImage: string | null;
    profilePhotoUrl: string | null;
    workType: string | null;
    salary: number | string | null;
    createdAt: string | null;
    updatedAt: string | null;
    address: string | null;
};

export const emptyPlaceholder = (value?: string | number | null) =>
    value == null || String(value).trim() === "" ? UNSPECIFIED_LABEL : String(value);

export type UpdateEmployeeRequest = {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    medeniDurum?: string;
    tc?: string;
    departmentId?: number;
    positionId?: number;
};
export type CreateEmployeeForm = {
    firstName: string;
    lastName: string;

    email: string;

    phoneCode: string;
    phoneNumber: string;

    birthDate: string;
    hireDate: string;

    gender: string;

    positionId: number;
    departmentId: number;
    subDepartmentId: number;

    medeniDurum: string;
    tc: string;

    profileFile?: File | null;
};

export type DepartmentPosition = {
    id: number;
    name: string;
    description?: string;
    subDepartmentId?: number | null;
};

export type SubDepartment = {
    id: number;
    name: string;
    description?: string;
    managerId?: number | null;
    positions?: DepartmentPosition[];
};

export type Department = {
    id: number;
    name: string;
    description?: string;
    managerId?: number | null;
    subDepartments?: SubDepartment[];
    deleted?: boolean;
};

export type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    positionId?: number | null;
    positionName?: string | null;
    departmentId?: number | null;
    departmentName?: string | null;
    subDepartmentId?: number | null;
    subDepartmentName?: string | null;
    hireDate?: string | null;
    gender?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    medeniDurum?: string | null;
    tc?: string | null;
    profileImage?: string | null;
    [key: string]: unknown;
};

export const MARITAL_STATUS_OPTIONS = [
    { value: "Bekar", label: "Bekar" },
    { value: "Evli", label: "Evli" },
];