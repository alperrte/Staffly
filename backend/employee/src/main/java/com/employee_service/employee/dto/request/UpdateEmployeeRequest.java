package com.employee_service.employee.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateEmployeeRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String status;

    private String phone;
    private LocalDate birthDate;
    private String gender;

    private Long departmentId;
    private String positionName;
}