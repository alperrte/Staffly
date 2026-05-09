package com.employee_service.employee.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

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
    private Long positionId;
    private String positionName;
    private String profileImage;
}