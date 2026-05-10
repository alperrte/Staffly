import axios from "axios";
import type {
    UpdateEmployeeRequest,
    Department,
    SubDepartment,
    DepartmentPosition,
    EmployeeApiResponse,
    NormalizedEmployee,
} from "../types/employeeTypes";

const employeeApi = axios.create({
    baseURL: "http://localhost:8082/api/v1",
});

const departmentApi = axios.create({
    baseURL: "http://localhost:8083",
});

const employeeAssetBaseUrl = "http://localhost:8082";

employeeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

departmentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const asString = (value: unknown, fallback = "") => {
    if (value == null) return fallback;
    const text = String(value).trim();
    return text || fallback;
};

const asNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const normalizeImageUrl = (profileImage?: string | null, imageVersion?: string | null) => {
    if (!profileImage) return null;

    const sanitized = profileImage.replace(/\\/g, "/");
    const absolute = sanitized.startsWith("http")
        ? sanitized
        : `${employeeAssetBaseUrl}/${sanitized.replace(/^\/+/, "")}`;

    if (!imageVersion) return absolute;

    const separator = absolute.includes("?") ? "&" : "?";
    return `${absolute}${separator}v=${encodeURIComponent(imageVersion)}`;
};

const pickTimestamp = (payload: EmployeeApiResponse) =>
    payload.updatedAt || payload.createdAt || String(payload.id);

const getIdentity = (payload: EmployeeApiResponse) => {
    const firstName = asString(payload.firstName);
    const lastName = asString(payload.lastName);
    const fullName = `${firstName} ${lastName}`.trim();

    return {
        firstName,
        lastName,
        fullName,
        employeeCode: `EMP-${String(payload.id).padStart(4, "0")}`,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?",
    };
};

export const normalizeEmployee = (
    payload: EmployeeApiResponse,
    employees: EmployeeApiResponse[] = []
): NormalizedEmployee => {
    const departmentId = asNumber(payload.departmentId);
    const subDepartmentId = asNumber(payload.subDepartmentId);
    const positionId = asNumber(payload.positionId);
    const managerId = asNumber(payload.managerId);
    const imageVersion = pickTimestamp(payload);
    const identity = getIdentity(payload);

    const departmentName = asString(payload.departmentName, "Belirtilmemiş");
    const subDepartmentName = asString(payload.subDepartmentName, "Belirtilmemiş");
    const positionName = asString(payload.positionName, payload.titleName || "Belirtilmemiş");
    const titleName = asString(payload.titleName, positionName);

    const managerEmployee =
        managerId != null
            ? employees.find((employee) => asNumber(employee.id) === managerId)
            : null;

    const derivedManagerName = managerEmployee
        ? `${asString(managerEmployee.firstName)} ${asString(managerEmployee.lastName)}`.trim()
        : "Belirtilmemiş";

    const hierarchyLabel = [departmentName, subDepartmentName, positionName]
        .filter((value) => value !== "Belirtilmemiş")
        .join(" / ") || "Belirtilmemiş";

    const imageUrl = normalizeImageUrl(payload.profilePhotoUrl || payload.profileImage, imageVersion);

    const workType = asString(payload.workType, "Belirtilmemiş");
    const salary = payload.salary == null || payload.salary === "" ? "Belirtilmemiş" : String(payload.salary);

    return {
        id: payload.id,
        basicInfo: {
            firstName: identity.firstName,
            lastName: identity.lastName,
            fullName: identity.fullName,
            employeeCode: identity.employeeCode,
            status: asString(payload.status, "Belirtilmemiş"),
            statusLabel: asString(payload.status, "Belirtilmemiş"),
        },
        contactInfo: {
            email: asString(payload.email, "Belirtilmemiş"),
            phone: asString(payload.phone, "Belirtilmemiş"),
            address: asString(payload.address, "Belirtilmemiş"),
        },
        organizationInfo: {
            departmentId,
            departmentName,
            subDepartmentId,
            subDepartmentName,
            positionId,
            positionName,
            titleName,
            managerId,
            managerName: asString(payload.managerName, derivedManagerName),
            hierarchyLabel,
        },
        workInfo: {
            hireDate: asString(payload.hireDate, "Belirtilmemiş"),
            workType,
            salary,
            gender: asString(payload.gender, "Belirtilmemiş"),
            medeniDurum: asString(payload.medeniDurum, "Belirtilmemiş"),
            birthDate: asString(payload.birthDate, "Belirtilmemiş"),
            tc: asString(payload.tc, "Belirtilmemiş"),
        },
        mediaInfo: {
            profileImage: payload.profileImage ?? null,
            profilePhotoUrl: imageUrl,
            imageVersion,
            initials: identity.initials || "?",
        },
        raw: payload,
        firstName: identity.firstName,
        lastName: identity.lastName,
        email: asString(payload.email),
        status: asString(payload.status),
        hireDate: payload.hireDate ?? null,
        phone: payload.phone ?? null,
        birthDate: payload.birthDate ?? null,
        gender: payload.gender ?? null,
        medeniDurum: payload.medeniDurum ?? null,
        tc: payload.tc ?? null,
        departmentId,
        departmentName: payload.departmentName ?? null,
        subDepartmentId,
        subDepartmentName: payload.subDepartmentName ?? null,
        positionId,
        positionName: payload.positionName ?? null,
        titleName,
        managerId,
        managerName: asString(payload.managerName, derivedManagerName),
        profileImage: payload.profileImage ?? null,
        profilePhotoUrl: imageUrl,
        workType: payload.workType ?? null,
        salary: payload.salary ?? null,
        createdAt: payload.createdAt ?? null,
        updatedAt: payload.updatedAt ?? null,
        address: payload.address ?? null,
    };
};

const normalizeListPayload = (payload: unknown): EmployeeApiResponse[] => {
    if (Array.isArray(payload)) return payload as EmployeeApiResponse[];
    return (payload as { content?: EmployeeApiResponse[] })?.content ?? [];
};

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
};

export const getAllEmployees = async (): Promise<NormalizedEmployee[]> => {
    const response = await employeeApi.get("/employees");
    const payload = normalizeListPayload(response.data);
    return payload.map((employee) => normalizeEmployee(employee, payload));
};

export const getPositions = async (): Promise<DepartmentPosition[]> => {
    const response = await departmentApi.get("/api/v1/positions");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getSubDepartments = async (): Promise<SubDepartment[]> => {
    const response = await departmentApi.get("/api/v1/sub-departments");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getEmployeeById = async (id: number) => {
    const response = await employeeApi.get(`/employees/${id}`);
    return normalizeEmployee(response.data);
};

export const createEmployee = async (data: CreateEmployeeRequest) => {
    const response = await employeeApi.post("/employees", data);
    return normalizeEmployee(response.data);
};

export const updateEmployee = async (id: number, data: UpdateEmployeeRequest) => {
    const response = await employeeApi.put(`/employees/${id}`, data);
    return normalizeEmployee(response.data);
};

export const deleteEmployee = async (id: number) => {
    const response = await employeeApi.delete(`/employees/${id}`);
    return response.data;
};

export const getDepartments = async (): Promise<Department[]> => {
    const response = await departmentApi.get("/departments");
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getSubDepartmentsByDepartmentId = async (
    departmentId: number
): Promise<SubDepartment[]> => {
    const response = await departmentApi.get(`/departments/${departmentId}/sub-departments`);
    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getPositionsBySubDepartmentId = async (
    subDepartmentId: number
): Promise<DepartmentPosition[]> => {
    const response = await departmentApi.get(
        `/departments/sub-departments/${subDepartmentId}/positions`
    );

    const payload = response.data;
    return Array.isArray(payload) ? payload : payload?.content ?? [];
};

export const getMyProfile = async () => {
    const response = await employeeApi.get("/employees/me");

    return response.data;
};

export const updateMyProfile = async (data: {
    phone?: string;
    email?: string;
}) => {

    const response = await employeeApi.patch(
        "/employees/me",
        data
    );

    return response.data;
};

export const uploadProfileImage = async (
    file: File
) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await employeeApi.post(
        "/employees/me/profile-image",
        formData
    );

    return response.data;
};

export const uploadEmployeeProfileImage = async (
    id: number,
    file: File
) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await employeeApi.post(
        `/employees/${id}/profile-image`,
        formData
    );

    return response.data;
};