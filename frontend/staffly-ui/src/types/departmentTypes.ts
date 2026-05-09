export type DepartmentPosition = {
    name: string;
    description: string;
};

export type SubDepartment = {
    name: string;
    description: string;
    managerId?: number | null;
    positions: DepartmentPosition[];
};

export type Department = {
    id?: number;
    name: string;
    description: string;
    managerId?: number | null;
    subDepartments: SubDepartment[];
    deleted?: boolean;
};

