package com.employee_service.employee.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate hireDate;
    private String status;

    private String phone;
    private LocalDate birthDate;
    private String gender;
    private String medeniDurum;
    private String tc;

    private Long departmentId;
    private String departmentName;
    private Long subDepartmentId;
    private String subDepartmentName;
    private Long positionId;
    private String positionName;
    private String titleName;
    private Long managerId;
    private String managerName;
    private String profileImage;
    private String profilePhotoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}