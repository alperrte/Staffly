export type CreateEmployeeRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    departmentId: number;
    positionId: number;
};

export type UpdateEmployeeRequest = {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    departmentId?: number;
    positionId?: number;
};

export type DepartmentPosition = {
    id: number;
    name: string;
    description?: string;
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
    [key: string]: unknown;
};